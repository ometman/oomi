import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import type { GivingRequest } from '../giving';

export interface PaymentSession {
  authorizationUrl?: string;
  reference: string;
  status?: 'PENDING';
  displayText?: string;
}

export interface PaymentResult {
  reference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  amountGhs?: number;
  designation?: string;
  channel?: string;
}

export interface GivingPaymentProvider {
  initializePayment(input: GivingRequest, callbackUrl: string): Promise<PaymentSession>;
  verifyPayment(reference: string): Promise<PaymentResult>;
  verifyWebhook(rawBody: string, signature: string): boolean;
}

interface PaystackResponse<T> {
  status: boolean;
  data?: T;
}

function parseMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

function secretKey() {
  const key = import.meta.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('Paystack is not configured.');
  return key;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secretKey()}`, 'Content-Type': 'application/json', ...init?.headers },
  });
  const result = await response.json().catch(() => null) as PaystackResponse<T> | null;
  if (!response.ok || !result?.status || !result.data) throw new Error('Paystack request failed.');
  return result.data;
}

export const paystackGivingProvider: GivingPaymentProvider = {
  async initializePayment(input, callbackUrl) {
    const reference = `OOM-${Date.now()}-${randomBytes(5).toString('hex')}`;
    if (input.channel === 'MOBILE_MONEY') {
      const data = await paystackRequest<{
        reference: string;
        status: string;
        display_text?: string;
      }>('/charge', {
        method: 'POST',
        body: JSON.stringify({
          email: input.email,
          amount: String(Math.round(input.amountGhs * 100)),
          currency: 'GHS',
          reference,
          mobile_money: {
            phone: input.mobileMoneyPhone,
            provider: input.mobileMoneyProvider,
          },
          metadata: {
            designation: input.designation,
            giving_region: input.givingRegion,
            first_name: input.firstName || '',
            source: 'OOM_WEBSITE_GIVING',
          },
        }),
      });
      if (data.reference !== reference || !['pay_offline', 'pending', 'processing'].includes(data.status)) {
        throw new Error('Unexpected Mobile Money response.');
      }
      return {
        reference,
        status: 'PENDING',
        displayText: data.display_text || 'Approve the payment on your phone using your Mobile Money PIN.',
      };
    }
    const channel = input.channel === 'CARD' ? 'card' : 'mobile_money';
    const data = await paystackRequest<{ authorization_url: string; reference: string }>('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        amount: String(Math.round(input.amountGhs * 100)),
        currency: 'GHS',
        reference,
        channels: [channel],
        callback_url: callbackUrl,
        metadata: JSON.stringify({
          designation: input.designation,
          giving_region: input.givingRegion,
          first_name: input.firstName || '',
          source: 'OOM_WEBSITE_GIVING',
          cancel_action: callbackUrl.replace('/complete', ''),
        }),
      }),
    });
    const checkoutUrl = new URL(data.authorization_url);
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.paystack.com') throw new Error('Unexpected checkout URL.');
    return { authorizationUrl: checkoutUrl.toString(), reference: data.reference };
  },

  async verifyPayment(reference) {
    const data = await paystackRequest<{
      reference: string;
      status: string;
      amount: number;
      currency: string;
      channel?: string;
      metadata?: { designation?: string } | string;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);
    if (data.reference !== reference) throw new Error('The verified transaction reference did not match the request.');
    const metadata = parseMetadata(data.metadata);
    const status = data.status === 'success' && data.currency === 'GHS' ? 'SUCCESS' : ['pending', 'ongoing', 'processing'].includes(data.status) ? 'PENDING' : 'FAILED';
    return {
      reference: data.reference,
      status,
      amountGhs: Number.isFinite(data.amount) ? data.amount / 100 : undefined,
      designation: typeof metadata.designation === 'string' ? metadata.designation : undefined,
      channel: data.channel,
    };
  },

  verifyWebhook(rawBody, signature) {
    if (!signature || !import.meta.env.PAYSTACK_SECRET_KEY) return false;
    const expected = createHmac('sha512', secretKey()).update(rawBody).digest('hex');
    const received = Buffer.from(signature, 'utf8');
    const computed = Buffer.from(expected, 'utf8');
    return received.length === computed.length && timingSafeEqual(received, computed);
  },
};

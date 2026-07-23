import type { NewsletterSubscriberInput } from '../newsletter';

export interface SubscribeResult {
  status: 'ACTIVE' | 'DUPLICATE' | 'REACTIVATED';
}

export interface UnsubscribeResult {
  status: 'UNSUBSCRIBED' | 'ALREADY_UNSUBSCRIBED';
}

export interface NewsletterProvider {
  subscribe(input: NewsletterSubscriberInput): Promise<SubscribeResult>;
  unsubscribe(token: string): Promise<UnsubscribeResult>;
}

async function callAppsScript<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const endpoint = import.meta.env.GOOGLE_APPS_SCRIPT_NEWSLETTER_URL;
  const secret = import.meta.env.NEWSLETTER_WEBHOOK_SECRET;
  if (!endpoint || !secret) throw new Error('Newsletter provider is not configured.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
    body: JSON.stringify({ action, secret, payload }),
    redirect: 'follow',
  });
  const result = await response.json().catch(() => null) as ({ ok?: boolean; data?: T } | null);
  if (!response.ok || !result?.ok || !result.data) throw new Error('Newsletter provider rejected the request.');
  return result.data;
}

export const appsScriptNewsletterProvider: NewsletterProvider = {
  subscribe(input) {
    return callAppsScript<SubscribeResult>('subscribe', input as unknown as Record<string, unknown>);
  },
  unsubscribe(token) {
    return callAppsScript<UnsubscribeResult>('unsubscribe', { token });
  },
};

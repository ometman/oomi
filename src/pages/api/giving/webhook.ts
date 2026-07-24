import type { APIRoute } from 'astro';
import { paystackGivingProvider } from '../../../lib/server/giving-provider';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';
  if (!paystackGivingProvider.verifyWebhook(rawBody, signature)) return new Response(null, { status: 401 });
  // Paystack remains the payment ledger in this first version. No donor data or full payload is logged.
  return new Response(null, { status: 200 });
};

export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });

import type { APIRoute } from 'astro';
import { validatePaymentReference } from '../../../lib/giving';
import { paystackGivingProvider } from '../../../lib/server/giving-provider';
import { apiJson, isRateLimited, requestKey } from '../../../lib/server/request-guard';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  if (isRateLimited(requestKey(request, 'giving-verify'), 20)) return apiJson({ error: 'Too many verification requests.' }, 429);
  const reference = validatePaymentReference(url.searchParams.get('reference'));
  if (!reference) return apiJson({ error: 'The payment reference is invalid.' }, 422);
  try {
    return apiJson(await paystackGivingProvider.verifyPayment(reference));
  } catch {
    return apiJson({ error: 'We could not verify this payment yet. Check again shortly.' }, 503);
  }
};

export const ALL: APIRoute = () => apiJson({ error: 'Method not allowed.' }, 405, { Allow: 'GET' });

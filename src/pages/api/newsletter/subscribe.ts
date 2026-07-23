import type { APIRoute } from 'astro';
import { validateNewsletterSubscription } from '../../../lib/newsletter';
import { appsScriptNewsletterProvider } from '../../../lib/server/newsletter-provider';
import { apiJson, isRateLimited, isSameOrigin, requestKey } from '../../../lib/server/request-guard';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (!isSameOrigin(request, url)) return apiJson({ error: 'Request origin was not accepted.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return apiJson({ error: 'JSON is required.' }, 415);
  if (isRateLimited(requestKey(request, 'newsletter-subscribe'))) return apiJson({ error: 'Too many requests. Please wait before trying again.' }, 429, { 'Retry-After': '900' });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return apiJson({ error: 'The request could not be read.' }, 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return apiJson({ error: 'The request could not be read.' }, 400);
  if (typeof input.company === 'string' && input.company.trim()) return apiJson({ accepted: true }, 202);
  const validation = validateNewsletterSubscription(input);
  if (!validation.valid || !validation.value) return apiJson({ error: 'Please review the form.', errors: validation.errors }, 422);
  try {
    const result = await appsScriptNewsletterProvider.subscribe(validation.value);
    return apiJson({ status: result.status, duplicate: result.status === 'DUPLICATE' }, result.status === 'DUPLICATE' ? 200 : 201);
  } catch {
    return apiJson({ error: 'Subscription is temporarily unavailable. Please try again later.' }, 503);
  }
};

export const ALL: APIRoute = () => apiJson({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });

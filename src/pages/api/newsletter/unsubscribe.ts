import type { APIRoute } from 'astro';
import { validateUnsubscribeToken } from '../../../lib/newsletter';
import { appsScriptNewsletterProvider } from '../../../lib/server/newsletter-provider';
import { apiJson, isRateLimited, isSameOrigin, requestKey } from '../../../lib/server/request-guard';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (!isSameOrigin(request, url)) return apiJson({ error: 'Request origin was not accepted.' }, 403);
  if (isRateLimited(requestKey(request, 'newsletter-unsubscribe'), 10)) return apiJson({ error: 'Too many requests. Please wait before trying again.' }, 429, { 'Retry-After': '900' });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return apiJson({ error: 'The request could not be read.' }, 400); }
  const token = validateUnsubscribeToken(input?.token);
  if (!token) return apiJson({ error: 'This unsubscribe link is invalid.' }, 422);
  try {
    const result = await appsScriptNewsletterProvider.unsubscribe(token);
    return apiJson(result);
  } catch {
    return apiJson({ error: 'We could not update your subscription. Please try again later.' }, 503);
  }
};

export const ALL: APIRoute = () => apiJson({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });

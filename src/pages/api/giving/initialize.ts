import type { APIRoute } from 'astro';
import { validateGivingRequest } from '../../../lib/giving';
import { paystackGivingProvider } from '../../../lib/server/giving-provider';
import { apiJson, isRateLimited, isSameOrigin, requestKey } from '../../../lib/server/request-guard';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (!isSameOrigin(request, url)) return apiJson({ error: 'Request origin was not accepted.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return apiJson({ error: 'JSON is required.' }, 415);
  if (isRateLimited(requestKey(request, 'giving-initialize'), 8)) return apiJson({ error: 'Too many payment attempts. Please wait before trying again.' }, 429, { 'Retry-After': '900' });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return apiJson({ error: 'The request could not be read.' }, 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return apiJson({ error: 'The request could not be read.' }, 400);
  if (typeof input.company === 'string' && input.company.trim()) return apiJson({ accepted: true }, 202);
  const validation = validateGivingRequest(input);
  if (!validation.valid || !validation.value) return apiJson({ error: 'Please review the form.', errors: validation.errors }, 422);
  if (
    validation.value.channel === 'MOBILE_MONEY' &&
    import.meta.env.MOBILE_MONEY_ENABLED === 'false'
  ) {
    return apiJson({ error: 'Mobile Money giving is temporarily unavailable. No payment has been taken.' }, 503);
  }
  if (
    validation.value.givingRegion === 'INTERNATIONAL' &&
    import.meta.env.INTERNATIONAL_GIVING_ENABLED !== 'true'
  ) {
    return apiJson({ error: 'International giving is coming soon. No payment has been taken.' }, 503);
  }

  const configuredOrigin = import.meta.env.GIVING_SITE_URL?.replace(/\/$/, '');
  let origin = url.origin;
  if (configuredOrigin) {
    try {
      const configuredUrl = new URL(configuredOrigin);
      if (configuredUrl.protocol !== 'https:' || configuredUrl.origin !== configuredOrigin) {
        throw new Error('GIVING_SITE_URL must be an HTTPS origin.');
      }
      origin = configuredUrl.origin;
    } catch {
      return apiJson({ error: 'Online giving is temporarily unavailable. No payment has been taken.' }, 503);
    }
  }
  try {
    const session = await paystackGivingProvider.initializePayment(validation.value, `${origin}/give/complete`);
    return apiJson(session, 201);
  } catch {
    return apiJson({ error: 'Online giving is temporarily unavailable. No payment has been taken.' }, 503);
  }
};

export const ALL: APIRoute = () => apiJson({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });

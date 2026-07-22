import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { prepareSubmission } from '../../lib/server/form-submissions';
import { deliverSubmission } from '../../lib/server/mail';

export const prerender = false;

const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

function clientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > MAX_ATTEMPTS;
}

export const POST: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json({ error: 'Request origin was not accepted.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return json({ error: 'JSON is required.' }, 415);
  if (isRateLimited(clientKey(request))) return json({ error: 'Too many requests. Please wait before trying again.' }, 429, { 'Retry-After': '900' });

  let input: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    input = parsed as Record<string, unknown>;
  } catch {
    return json({ error: 'The request could not be read.' }, 400);
  }

  if (typeof input.company === 'string' && input.company.trim()) return json({ accepted: true }, 202);
  const prepared = prepareSubmission(input.kind, input);
  if (!prepared.valid || !prepared.submission) return json({ error: 'Please review the form.', errors: prepared.errors }, 422);

  const reference = `OOM-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
  try {
    await deliverSubmission(prepared.submission, reference);
    return json({ reference }, 201);
  } catch {
    return json({ error: 'Delivery is temporarily unavailable. Please try again later.' }, 503);
  }
};

export const ALL: APIRoute = () => json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });

const attempts = new Map<string, number[]>();

export function requestKey(request: Request, scope: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${scope}:${ip}`;
}

export function isRateLimited(key: string, maximum = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > maximum;
}

export function isSameOrigin(request: Request, url: URL) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === url.host; } catch { return false; }
}

export function apiJson(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

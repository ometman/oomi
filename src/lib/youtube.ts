const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

export function getYouTubeVideoId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return '';

    let videoId = '';
    if (url.hostname.toLowerCase().endsWith('youtu.be')) {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v') || '';
    } else {
      const [route, candidate] = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(route || '')) videoId = candidate || '';
    }

    return VIDEO_ID_PATTERN.test(videoId) ? videoId : '';
  } catch {
    return '';
  }
}

export function getYouTubeEmbedUrl(value: unknown): string {
  const videoId = getYouTubeVideoId(value);
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`
    : '';
}

export function getYouTubeThumbnailUrl(value: unknown): string {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

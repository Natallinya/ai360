const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

export function parseAndValidateUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('URL is required');
  }

  let url: URL;
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS links are supported');
  }

  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith('.local')) {
    throw new Error('This URL is not allowed');
  }

  if (/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(url.hostname)) {
    throw new Error('Private network URLs are not allowed');
  }

  return url;
}

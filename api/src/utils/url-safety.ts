const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

export function assertSafePublicUrl(raw: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error('Некорректный URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Разрешены только ссылки http/https');
  }

  const host = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(host) || host.endsWith('.local')) {
    throw new Error('Этот адрес нельзя запрашивать с сервера');
  }

  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    throw new Error('Локальные адреса запрещены');
  }

  return parsed;
}

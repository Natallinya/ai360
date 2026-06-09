import { wbProductImageUrlCandidates } from '../utils/wb-image-url.js';

const WB_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const resolvedUrlCache = new Map<number, string | null>();

export function wbImageProxyPath(nmId: number): string {
  return `/api/wb-image/${nmId}`;
}

export async function resolveWbProductImageUrl(nmId: number): Promise<string | null> {
  if (resolvedUrlCache.has(nmId)) {
    return resolvedUrlCache.get(nmId) ?? null;
  }

  for (const url of wbProductImageUrlCandidates(nmId)) {
    if (await wbImageExists(url)) {
      resolvedUrlCache.set(nmId, url);
      return url;
    }
  }

  resolvedUrlCache.set(nmId, null);
  return null;
}

export async function wbImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': WB_USER_AGENT },
      signal: AbortSignal.timeout(3_000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

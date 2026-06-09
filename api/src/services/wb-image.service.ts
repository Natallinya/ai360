import { wbProductImageUrl, wbProductImageUrlCandidates } from '../utils/wb-image-url.js';

const WB_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const HEAD_TIMEOUT_MS = 1_500;
const MAX_FALLBACK_CANDIDATES = 8;

const resolvedUrlCache = new Map<number, string | null>();

export function wbImageProxyPath(nmId: number): string {
  return `/api/wb-image/${nmId}`;
}

export async function resolveWbProductImageUrl(nmId: number): Promise<string | null> {
  if (resolvedUrlCache.has(nmId)) {
    return resolvedUrlCache.get(nmId) ?? null;
  }

  const primary = wbProductImageUrl(nmId);
  if (await wbImageExists(primary)) {
    resolvedUrlCache.set(nmId, primary);
    return primary;
  }

  const fallbacks = wbProductImageUrlCandidates(nmId)
    .filter((url) => url !== primary)
    .slice(0, MAX_FALLBACK_CANDIDATES);

  const found = await findFirstExistingUrl(fallbacks);
  resolvedUrlCache.set(nmId, found);
  return found;
}

async function findFirstExistingUrl(urls: string[]): Promise<string | null> {
  if (urls.length === 0) {
    return null;
  }

  return new Promise((resolve) => {
    let pending = urls.length;
    let settled = false;

    for (const url of urls) {
      void wbImageExists(url).then((exists) => {
        if (settled) {
          return;
        }

        if (exists) {
          settled = true;
          resolve(url);
          return;
        }

        pending -= 1;
        if (pending === 0) {
          resolve(null);
        }
      });
    }
  });
}

export async function wbImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': WB_USER_AGENT },
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    });

    return response.ok;
  } catch {
    return false;
  }
}

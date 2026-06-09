import { AnimalFusionResponse } from '../models/animal-fusion.model.js';

interface CachedFusionImage {
  buffer: Buffer;
  contentType: string;
  provider: AnimalFusionResponse['provider'];
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 60_000;
const imageCache = new Map<string, CachedFusionImage>();

export function storeFusionImage(
  cacheId: string,
  buffer: Buffer,
  contentType: string,
  provider: AnimalFusionResponse['provider'],
): void {
  imageCache.set(cacheId, {
    buffer,
    contentType,
    provider,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function getFusionImageProvider(
  cacheId: string,
): AnimalFusionResponse['provider'] | null {
  return getFusionImage(cacheId)?.provider ?? null;
}

export function getFusionImage(cacheId: string): CachedFusionImage | null {
  const entry = imageCache.get(cacheId);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    imageCache.delete(cacheId);
    return null;
  }

  return entry;
}

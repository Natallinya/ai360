import { ProductOffer } from '../models/product-offer.model';
import { apiUrl } from './api-url';

const PLACEHOLDER_HOST = 'placehold.co';

/** Нормализует URL картинки WB (старые /api/wb-image и битые basket-XX оставляем для prune). */
export function normalizeOfferImageUrl(offer: ProductOffer): ProductOffer {
  if (offer.source !== 'wildberries') {
    return offer;
  }

  if (offer.imageUrl.includes('wbbasket.ru')) {
    return offer;
  }

  const nmId = extractWbNmId(offer);
  if (!nmId) {
    return offer;
  }

  const proxyUrl = apiUrl(`/api/wb-image/${nmId}`);
  if (offer.imageUrl === proxyUrl) {
    return offer;
  }

  return { ...offer, imageUrl: proxyUrl };
}

export function isPlaceholderImageUrl(url: string): boolean {
  try {
    return new URL(url, window.location.origin).hostname.includes(PLACEHOLDER_HOST);
  } catch {
    return url.includes(PLACEHOLDER_HOST);
  }
}

export function imageUrlLoads(url: string): Promise<boolean> {
  if (isPlaceholderImageUrl(url)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';

    const finish = (ok: boolean) => {
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };

    img.onload = () => finish(img.naturalWidth > 0 && img.naturalHeight > 0);
    img.onerror = () => finish(false);
    img.src = url;
  });
}

function extractWbNmId(offer: ProductOffer): string | null {
  const fromUrl = offer.productUrl.match(/\/catalog\/(\d+)\//)?.[1];
  if (fromUrl) {
    return fromUrl;
  }

  if (/^\d+$/.test(offer.externalId)) {
    return offer.externalId;
  }

  const fromImage = offer.imageUrl.match(/\/(\d{6,})\/images\//)?.[1];
  return fromImage ?? null;
}

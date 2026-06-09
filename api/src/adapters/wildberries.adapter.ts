import { ProductOffer } from '../models/product-offer.model.js';
import { wbImageProxyPath } from '../services/wb-image.service.js';
import { SearchAdapter, SearchAdapterResult } from './search-adapter.interface.js';

const WB_DEST = '-1257786';
const WB_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MIN_REQUEST_INTERVAL_MS = 2_000;
const CACHE_TTL_MS = 5 * 60_000;
const MAX_OFFERS = 20;

const WB_ENDPOINTS = [
  'https://search.wb.ru/exactmatch/ru/common/v18/search',
  'https://u-search.wb.ru/exactmatch/ru/common/v18/search',
  'https://search.wb.ru/exactmatch/ru/common/v5/search',
] as const;

interface WbPriceBlock {
  product?: number;
  basic?: number;
}

interface WbSize {
  price?: WbPriceBlock;
}

interface WbProduct {
  id: number;
  name: string;
  brand?: string;
  pics?: number;
  sizes?: WbSize[];
}

interface WbSearchResponse {
  products?: WbProduct[];
}

const responseCache = new Map<string, { expiresAt: number; data: WbSearchResponse }>();
let lastRequestAt = 0;

/** Публичный JSON-поиск WB (тот же эндпоинт, что использует сайт). */
export class WildberriesSearchAdapter implements SearchAdapter {
  readonly id = 'wildberries';

  isEnabled(): boolean {
    return true;
  }

  async search(query: string): Promise<SearchAdapterResult> {
    const normalized = query.trim().toLowerCase();
    const cached = responseCache.get(normalized);
    if (cached && cached.expiresAt > Date.now()) {
      return mapWbResponse(cached.data);
    }

    const data = await fetchWbSearch(normalized);
    responseCache.set(normalized, { expiresAt: Date.now() + CACHE_TTL_MS, data });

    return mapWbResponse(data);
  }
}

function mapWbResponse(data: WbSearchResponse): SearchAdapterResult {
  const fetchedAt = new Date().toISOString();

  const offers: ProductOffer[] = (data.products ?? [])
    .filter((item) => item.pics !== 0)
    .slice(0, MAX_OFFERS)
    .map((item) => {
      const priceKopecks = item.sizes?.[0]?.price?.product ?? 0;
      const title = item.brand ? `${item.name} (${item.brand})` : item.name;

      return {
        id: `wb-${item.id}`,
        source: 'wildberries' as const,
        externalId: String(item.id),
        title,
        price: Math.round(priceKopecks / 100),
        currency: 'RUB',
        imageUrl: wbImageProxyPath(item.id),
        productUrl: `https://www.wildberries.ru/catalog/${item.id}/detail.aspx`,
        availability: priceKopecks > 0 ? 'in_stock' : 'unknown',
        fetchedAt,
      };
    });

  return { source: 'wildberries', offers };
}

async function fetchWbSearch(query: string): Promise<WbSearchResponse> {
  await throttleWbRequests();

  let lastStatus = 0;

  for (const endpoint of WB_ENDPOINTS) {
    const response = await requestWbSearch(endpoint, query);

    if (response.ok) {
      return (await response.json()) as WbSearchResponse;
    }

    lastStatus = response.status;

    if (response.status !== 429) {
      break;
    }
  }

  if (lastStatus === 429) {
    throw new Error(
      'Wildberries временно ограничил запросы. Подождите 1–2 минуты и повторите — или используйте Mock/DummyJSON.',
    );
  }

  throw new Error(`Wildberries search failed (${lastStatus || 'network error'})`);
}

async function requestWbSearch(endpoint: string, query: string): Promise<Response> {
  const url = new URL(endpoint);
  url.searchParams.set('appType', '1');
  url.searchParams.set('curr', 'rub');
  url.searchParams.set('dest', WB_DEST);
  url.searchParams.set('inheritFilters', 'false');
  url.searchParams.set('lang', 'ru');
  url.searchParams.set('page', '1');
  url.searchParams.set('query', query);
  url.searchParams.set('resultset', 'catalog');
  url.searchParams.set('sort', 'popular');
  url.searchParams.set('spp', '30');
  url.searchParams.set('suppressSpellcheck', 'false');

  const headers = {
    'User-Agent': WB_USER_AGENT,
    Accept: 'application/json',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    Referer: 'https://www.wildberries.ru/',
    Origin: 'https://www.wildberries.ru',
  };

  for (const delayMs of [0, 2_000, 5_000]) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(12_000),
    });

    if (response.status !== 429) {
      lastRequestAt = Date.now();
      return response;
    }
  }

  lastRequestAt = Date.now();
  return fetch(url, { headers, signal: AbortSignal.timeout(12_000) });
}

async function throttleWbRequests(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

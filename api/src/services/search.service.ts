import { DummyJsonSearchAdapter } from '../adapters/dummyjson.adapter.js';
import { MockSearchAdapter } from '../adapters/mock.adapter.js';
import { WildberriesSearchAdapter } from '../adapters/wildberries.adapter.js';
import { SearchAdapter } from '../adapters/search-adapter.interface.js';
import { SearchResponse, SearchSourceStatus } from '../models/product-offer.model.js';

const adapters: SearchAdapter[] = [
  new MockSearchAdapter(),
  new WildberriesSearchAdapter(),
  new DummyJsonSearchAdapter(),
];

export async function searchProducts(query: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  const sources: Record<string, SearchSourceStatus> = {};
  const offers: SearchResponse['offers'] = [];

  if (trimmed.length < 2) {
    return { query: trimmed, offers: [], sources: {} };
  }

  for (const adapter of adapters) {
    try {
      const result = await adapter.search(trimmed);
      sources[adapter.id] = { status: 'ok', count: result.offers.length };
      offers.push(...result.offers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      sources[adapter.id] = { status: 'error', message, count: 0 };
    }
  }

  offers.sort((a, b) => a.price - b.price);

  return { query: trimmed, offers, sources };
}

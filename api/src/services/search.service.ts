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

  const results = await Promise.allSettled(adapters.map((adapter) => adapter.search(trimmed)));

  for (const [index, settled] of results.entries()) {
    const adapter = adapters[index]!;

    if (settled.status === 'fulfilled') {
      sources[adapter.id] = { status: 'ok', count: settled.value.offers.length };
      offers.push(...settled.value.offers);
    } else {
      const message =
        settled.reason instanceof Error ? settled.reason.message : 'unknown error';
      sources[adapter.id] = { status: 'error', message, count: 0 };
    }
  }

  offers.sort((a, b) => a.price - b.price);

  return { query: trimmed, offers, sources };
}

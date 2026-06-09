import { MOCK_CATALOG } from '../data/mock-catalog.js';
import { ProductOffer } from '../models/product-offer.model.js';
import { SearchAdapter, SearchAdapterResult } from './search-adapter.interface.js';

export class MockSearchAdapter implements SearchAdapter {
  readonly id = 'mock';

  isEnabled(): boolean {
    return true;
  }

  async search(query: string): Promise<SearchAdapterResult> {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) {
      return { source: this.id, offers: [] };
    }

    const tokens = normalized.split(/\s+/).filter(Boolean);
    const offers: ProductOffer[] = MOCK_CATALOG.filter((offer) => {
      const haystack = `${offer.title} ${offer.source}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }).map((offer) => ({
      ...offer,
      fetchedAt: new Date().toISOString(),
    }));

    return { source: this.id, offers };
  }
}

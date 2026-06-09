import { ProductOffer } from '../models/product-offer.model.js';
import { SearchAdapter, SearchAdapterResult, SearchOptions } from './search-adapter.interface.js';

interface DummyJsonProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  brand?: string;
}

interface DummyJsonSearchResponse {
  products: DummyJsonProduct[];
}

/** Публичный демо-API без ключей: https://dummyjson.com/docs/products */
export class DummyJsonSearchAdapter implements SearchAdapter {
  readonly id = 'dummyjson';

  isEnabled(): boolean {
    return true;
  }

  async search(query: string, _options?: SearchOptions): Promise<SearchAdapterResult> {
    const url = new URL('https://dummyjson.com/products/search');
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', '20');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`DummyJSON failed (${response.status})`);
    }

    const data = (await response.json()) as DummyJsonSearchResponse;
    const fetchedAt = new Date().toISOString();

    const offers: ProductOffer[] = (data.products ?? []).map((item) => ({
      id: `dummyjson-${item.id}`,
      source: 'dummyjson',
      externalId: String(item.id),
      title: item.brand ? `${item.title} (${item.brand})` : item.title,
      price: item.price,
      currency: 'USD',
      imageUrl:
        item.thumbnail ??
        item.images?.[0] ??
        'https://placehold.co/320x240/1e293b/e2e8f0?text=Product',
      productUrl: `https://dummyjson.com/products/${item.id}`,
      availability: 'in_stock',
      fetchedAt,
    }));

    return { source: this.id, offers };
  }
}

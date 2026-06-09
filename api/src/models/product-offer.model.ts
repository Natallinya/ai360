export type ProductAvailability = 'in_stock' | 'unknown';

export type MarketplaceSource =
  | 'mock'
  | 'demo-store'
  | 'dummyjson'
  | 'wildberries'
  | 'fusion'
  | 'allegro'
  | 'yandex-market'
  | 'other';

export interface ImportFromUrlResponse {
  offer: ProductOffer;
  warnings: string[];
}

export interface ProductOffer {
  id: string;
  source: MarketplaceSource;
  externalId: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  availability: ProductAvailability;
  fetchedAt: string;
}

export interface SearchSourceStatus {
  status: 'ok' | 'skipped' | 'error';
  message?: string;
  count?: number;
}

export interface SearchResponse {
  query: string;
  offers: ProductOffer[];
  sources: Record<string, SearchSourceStatus>;
}

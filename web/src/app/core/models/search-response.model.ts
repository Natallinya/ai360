import { ProductOffer } from './product-offer.model';

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

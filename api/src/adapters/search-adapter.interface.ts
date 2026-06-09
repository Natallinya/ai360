import { ProductOffer } from '../models/product-offer.model.js';

export interface SearchAdapterResult {
  source: string;
  offers: ProductOffer[];
  error?: string;
}

export interface SearchOptions {
  wbPage?: number;
}

export interface SearchAdapter {
  readonly id: string;
  isEnabled(): boolean;
  search(query: string, options?: SearchOptions): Promise<SearchAdapterResult>;
}

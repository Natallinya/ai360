import { ProductOffer } from '../models/product-offer.model.js';

export interface SearchAdapterResult {
  source: string;
  offers: ProductOffer[];
  error?: string;
}

export interface SearchAdapter {
  readonly id: string;
  isEnabled(): boolean;
  search(query: string): Promise<SearchAdapterResult>;
}

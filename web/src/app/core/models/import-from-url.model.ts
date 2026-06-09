import { ProductOffer } from './product-offer.model';

export interface ImportFromUrlResponse {
  offer: ProductOffer;
  warnings: string[];
}

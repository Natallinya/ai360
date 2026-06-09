import { ProductOffer } from './product-offer.model';

export type WishlistItemStatus = 'active' | 'purchased' | 'archived';

export interface WishlistItem {
  id: string;
  offerSnapshot: ProductOffer;
  note?: string;
  status: WishlistItemStatus;
  addedAt: string;
}

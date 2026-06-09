import { Injectable, computed, signal } from '@angular/core';

import { ProductOffer } from '../models/product-offer.model';
import { WishlistItem, WishlistItemStatus } from '../models/wishlist-item.model';
import { imageUrlLoads, normalizeOfferImageUrl } from '../utils/offer-image.utils';

const STORAGE_KEY = 'wishlist-aggregator-items';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly itemsSignal = signal<WishlistItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly activeCount = computed(
    () => this.itemsSignal().filter((item) => item.status === 'active').length,
  );

  add(offer: ProductOffer): boolean {
    const normalized = normalizeOfferImageUrl(offer);
    const exists = this.itemsSignal().some(
      (item) => item.offerSnapshot.productUrl === normalized.productUrl,
    );
    if (exists) {
      return false;
    }

    const item: WishlistItem = {
      id: crypto.randomUUID(),
      offerSnapshot: { ...normalized },
      status: 'active',
      addedAt: new Date().toISOString(),
    };

    this.persist([item, ...this.itemsSignal()]);
    return true;
  }

  remove(id: string): void {
    this.persist(this.itemsSignal().filter((item) => item.id !== id));
  }

  setStatus(id: string, status: WishlistItemStatus): void {
    this.persist(
      this.itemsSignal().map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  isInWishlist(productUrl: string): boolean {
    return this.itemsSignal().some((item) => item.offerSnapshot.productUrl === productUrl);
  }

  /** Удаляет позиции, у которых картинка не загружается (для чистой демо-выдачи). */
  async pruneBrokenImages(): Promise<number> {
    const items = this.itemsSignal();
    if (items.length === 0) {
      return 0;
    }

    const normalized = items.map((item) => ({
      ...item,
      offerSnapshot: normalizeOfferImageUrl(item.offerSnapshot),
    }));

    const results = await Promise.all(
      normalized.map(async (item) => ({
        item,
        loads: await imageUrlLoads(item.offerSnapshot.imageUrl),
      })),
    );

    const kept = results.filter((entry) => entry.loads).map((entry) => entry.item);
    const removed = items.length - kept.length;
    const urlsUpdated = normalized.some(
      (item, index) => item.offerSnapshot.imageUrl !== items[index]?.offerSnapshot.imageUrl,
    );

    if (removed > 0 || urlsUpdated) {
      this.persist(kept);
    }

    return removed;
  }

  private persist(items: WishlistItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private loadFromStorage(): WishlistItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as WishlistItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item) => ({
        ...item,
        offerSnapshot: normalizeOfferImageUrl(item.offerSnapshot),
      }));
    } catch {
      return [];
    }
  }
}

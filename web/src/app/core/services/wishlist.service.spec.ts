import { TestBed } from '@angular/core/testing';

import { sampleOffer } from '../../testing/product-offer.fixture';
import { WishlistService } from './wishlist.service';

describe('WishlistService', () => {
  let service: WishlistService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WishlistService);
  });

  it('starts empty', () => {
    expect(service.items().length).toBe(0);
    expect(service.activeCount()).toBe(0);
  });

  it('adds offer and persists to localStorage', () => {
    const offer = sampleOffer();
    expect(service.add(offer)).toBe(true);
    expect(service.items().length).toBe(1);
    expect(service.isInWishlist(offer.productUrl)).toBe(true);
    expect(localStorage.getItem('wishlist-aggregator-items')).toContain(offer.title);
  });

  it('rejects duplicate by productUrl', () => {
    const offer = sampleOffer();
    service.add(offer);
    expect(service.add(offer)).toBe(false);
    expect(service.items().length).toBe(1);
  });

  it('removes item by id', () => {
    const offer = sampleOffer();
    service.add(offer);
    const id = service.items()[0]!.id;
    service.remove(id);
    expect(service.items().length).toBe(0);
  });

  it('updates status', () => {
    const offer = sampleOffer();
    service.add(offer);
    const id = service.items()[0]!.id;
    service.setStatus(id, 'purchased');
    expect(service.items()[0]!.status).toBe('purchased');
    expect(service.activeCount()).toBe(0);
  });
});

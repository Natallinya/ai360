import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { sampleOffer } from '../../../testing/product-offer.fixture';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders title and wishlist button', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('offer', sampleOffer());
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Термокружка');
    expect(el.textContent).toContain('В вишлист');
    expect(el.textContent).toContain('В магазин');
  });

  it('adds offer to wishlist on click', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    const offer = sampleOffer();
    fixture.componentRef.setInput('offer', offer);
    fixture.detectChanges();

    const wishlist = TestBed.inject(WishlistService);
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const wishlistBtn = Array.from(buttons).find((b) => b.textContent?.includes('В вишлист'));
    wishlistBtn?.click();
    fixture.detectChanges();

    expect(wishlist.isInWishlist(offer.productUrl)).toBe(true);
  });
});

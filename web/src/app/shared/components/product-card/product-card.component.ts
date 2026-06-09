import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { ProductOffer } from '../../../core/models/product-offer.model';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SourceLabelPipe } from '../../utils/source-label.pipe';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, SourceLabelPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  private readonly wishlist = inject(WishlistService);

  readonly offer = input.required<ProductOffer>();
  readonly showWishlistAction = input(true);

  readonly added = output<void>();
  readonly duplicate = output<void>();

  protected readonly inWishlist = computed(() => {
    this.wishlist.items();
    return this.wishlist.isInWishlist(this.offer().productUrl);
  });

  protected onAdd(): void {
    const added = this.wishlist.add(this.offer());
    if (added) {
      this.added.emit();
    } else {
      this.duplicate.emit();
    }
  }

  protected readonly placeholderImage =
    'https://placehold.co/320x240/334155/e2e8f0?text=No+image';

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('placehold.co')) {
      img.src = this.placeholderImage;
    }
  }
}

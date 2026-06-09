import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
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
  host: {
    class: 'product-card-host',
    '[class.product-card-host--hidden]': 'imageFailed()',
  },
})
export class ProductCardComponent {
  private readonly wishlist = inject(WishlistService);

  readonly offer = input.required<ProductOffer>();
  readonly showWishlistAction = input(true);

  readonly added = output<void>();
  readonly duplicate = output<void>();
  readonly imageBroken = output<void>();

  protected readonly imageFailed = signal(false);

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

  protected onImageError(): void {
    if (this.imageFailed()) {
      return;
    }

    this.imageFailed.set(true);
    this.imageBroken.emit();
  }
}

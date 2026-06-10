import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Image } from 'primeng/image';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';

import { ProductOffer } from '../../../core/models/product-offer.model';
import { apiUrl } from '../../../core/utils/api-url';
import { OffersApiService } from '../../../core/services/offers-api.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { TEST_PRODUCT_URLS } from '../data/test-product-urls';
import { UrlImportFormComponent } from '../components/url-import-form/url-import-form.component';

@Component({
  selector: 'app-add-by-url-page',
  imports: [
    FormsModule,
    UrlImportFormComponent,
    Button,
    InputText,
    CurrencyPipe,
    Card,
    Image,
    Message,
    PrimeTemplate,
    Tag,
  ],
  templateUrl: './add-by-url.page.html',
  styleUrl: './add-by-url.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddByUrlPage {
  private readonly offersApi = inject(OffersApiService);
  private readonly wishlist = inject(WishlistService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly warnings = signal<string[]>([]);
  protected readonly preview = signal<ProductOffer | null>(null);
  protected readonly editTitle = signal('');
  protected readonly editPrice = signal<number | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly testUrls = TEST_PRODUCT_URLS;
  protected readonly bffOnline = signal<boolean | null>(null);

  protected readonly displayOffer = computed((): ProductOffer | null => {
    const base = this.preview();
    if (!base) {
      return null;
    }

    const title = this.editTitle().trim() || base.title;
    const price = this.editPrice() ?? base.price;

    if (title === base.title && price === base.price) {
      return base;
    }

    return { ...base, title, price };
  });

  protected readonly needsManualEdit = computed(() => {
    const offer = this.preview();
    if (!offer) {
      return false;
    }

    const badTitle = /нет соединения|доступ ограничен|captcha/i.test(offer.title);
    return badTitle || offer.price <= 0 || this.warnings().length > 0;
  });

  constructor() {
    void this.checkBffHealth();
  }

  protected useTestUrl(url: string): void {
    void this.onLoadUrl(url);
  }

  protected async onLoadUrl(url: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.warnings.set([]);
    this.preview.set(null);

    try {
      const result = await this.offersApi.importFromUrl(url);
      this.preview.set(result.offer);
      this.warnings.set(result.warnings);
      const title = result.offer.title.trim();
      this.editTitle.set(title);
      this.editPrice.set(result.offer.price > 0 ? result.offer.price : null);
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected onAddToWishlist(): void {
    const offer = this.displayOffer();
    if (!offer) {
      return;
    }

    if (!offer.title.trim()) {
      this.error.set('Укажите название товара перед сохранением.');
      return;
    }

    const added = this.wishlist.add(offer);
    if (added) {
      this.showToast('Добавлено в вишлист');
      void this.router.navigate(['/wishlist']);
    } else {
      this.showToast('Этот товар уже в вишлисте');
    }
  }

  protected isInWishlist(): boolean {
    const offer = this.preview();
    return offer ? this.wishlist.isInWishlist(offer.productUrl) : false;
  }

  protected openShop(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  protected goWishlist(): void {
    void this.router.navigate(['/wishlist']);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(null), 2500);
  }

  private async checkBffHealth(): Promise<void> {
    try {
      const res = await fetch(apiUrl('/api/health'));
      this.bffOnline.set(res.ok);
    } catch {
      this.bffOnline.set(false);
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: string } | null;
      if (body?.error) {
        return body.error;
      }
      return `Ошибка сервера (${err.status}). Запущен ли BFF?`;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Не удалось загрузить страницу. Проверьте ссылку и BFF.';
  }
}

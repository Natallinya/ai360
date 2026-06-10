import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';

import { AnimalFusionResponse } from '../../../core/models/animal-fusion.model';
import { ProductOffer } from '../../../core/models/product-offer.model';
import { AnimalFusionApiService } from '../../../core/services/animal-fusion-api.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import {
  FusionFormComponent,
  FusionFormSubmit,
} from '../components/fusion-form/fusion-form.component';

@Component({
  selector: 'app-animal-fusion-page',
  imports: [FusionFormComponent, Button, Card, Message, PrimeTemplate],
  templateUrl: './animal-fusion.page.html',
  styleUrl: './animal-fusion.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalFusionPage {
  private readonly fusionApi = inject(AnimalFusionApiService);
  private readonly wishlist = inject(WishlistService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly result = signal<AnimalFusionResponse | null>(null);
  protected readonly toast = signal<string | null>(null);

  protected goWishlist(): void {
    void this.router.navigate(['/wishlist']);
  }

  protected async onFuse(payload: FusionFormSubmit): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);

    try {
      const response = await this.fusionApi.fuseAnimals(payload);
      this.result.set(response);
    } catch (err) {
      this.error.set(this.extractError(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected onImageError(): void {
    this.error.set('Картинка не загрузилась. Проверьте, что BFF запущен, и попробуйте снова.');
  }

  protected addToWishlist(): void {
    const fusion = this.result();
    if (!fusion) {
      return;
    }

    const offer: ProductOffer = {
      id: `fusion-${fusion.animal1}-${fusion.animal2}-${Date.now()}`,
      source: 'fusion',
      externalId: `${fusion.animal1}+${fusion.animal2}`,
      title: fusion.title,
      price: 0,
      currency: 'RUB',
      imageUrl: fusion.imageUrl,
      productUrl: `fusion://${encodeURIComponent(fusion.animal1)}/${encodeURIComponent(fusion.animal2)}`,
      availability: 'unknown',
      fetchedAt: new Date().toISOString(),
    };

    const added = this.wishlist.add(offer);
    if (added) {
      this.showToast('Гибрид добавлен в вишлист');
      void this.router.navigate(['/wishlist']);
    } else {
      this.showToast('Такой гибрид уже в вишлисте');
    }
  }

  private showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(null), 2500);
  }

  private extractError(err: unknown): string {
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
    return 'Не удалось создать гибрида.';
  }
}

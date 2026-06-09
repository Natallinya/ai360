import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { ProductOffer } from '../../../core/models/product-offer.model';
import { SearchSourceStatus } from '../../../core/models/search-response.model';
import { BffWarmupService } from '../../../core/services/bff-warmup.service';
import { SearchApiService } from '../../../core/services/search-api.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SearchFormComponent } from '../../../shared/components/search-form/search-form.component';

@Component({
  selector: 'app-search-results-page',
  imports: [SearchFormComponent, ProductCardComponent],
  templateUrl: './search-results.page.html',
  styleUrl: './search-results.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchApi = inject(SearchApiService);
  private readonly bffWarmup = inject(BffWarmupService);

  protected readonly query = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q')?.trim() ?? '')),
    { initialValue: '' },
  );

  protected readonly loading = signal(false);
  protected readonly wakingServer = signal(false);
  protected readonly results = signal<ProductOffer[]>([]);
  protected readonly sources = signal<Record<string, SearchSourceStatus>>({});
  protected readonly error = signal<string | null>(null);
  protected readonly toast = signal<string | null>(null);

  constructor() {
    effect(() => {
      void this.runSearch(this.query());
    });
  }

  protected onSearch(query: string): void {
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  protected showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(null), 2500);
  }

  protected sourceEntries(): [string, SearchSourceStatus][] {
    return Object.entries(this.sources());
  }

  private async runSearch(query: string): Promise<void> {
    if (query.length < 2) {
      this.results.set([]);
      this.sources.set({});
      this.error.set(null);
      return;
    }

    this.loading.set(true);
    this.wakingServer.set(true);
    this.error.set(null);

    try {
      await this.bffWarmup.warmup();
      this.wakingServer.set(false);
      const response = await this.searchApi.search(query);
      this.results.set(response.offers);
      this.sources.set(response.sources);
    } catch (err) {
      this.results.set([]);
      this.sources.set({});
      this.error.set(
        err instanceof Error
          ? err.message
          : 'Не удалось выполнить поиск. Запустите BFF: cd api && npm run dev',
      );
    } finally {
      this.wakingServer.set(false);
      this.loading.set(false);
    }
  }
}

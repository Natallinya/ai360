import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';

import { ProductOffer } from '../../../core/models/product-offer.model';
import { SearchSourceStatus } from '../../../core/models/search-response.model';
import { environment } from '../../../../environments/environment';
import { BffWarmupService } from '../../../core/services/bff-warmup.service';
import { SearchApiService } from '../../../core/services/search-api.service';
import { formatHttpError } from '../../../core/utils/http-error-message';
import {
  filterOffersWithWorkingImages,
  normalizeOfferImageUrl,
} from '../../../core/utils/offer-image.utils';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SearchFormComponent } from '../../../shared/components/search-form/search-form.component';

const PAGE_SIZE = 9;
const MAX_WB_PAGES = 8;

@Component({
  selector: 'app-search-results-page',
  imports: [SearchFormComponent, ProductCardComponent, Button, Message, Tag],
  templateUrl: './search-results.page.html',
  styleUrl: './search-results.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchApi = inject(SearchApiService);
  private readonly bffWarmup = inject(BffWarmupService);

  protected readonly pageSize = PAGE_SIZE;

  protected readonly query = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q')?.trim() ?? '')),
    { initialValue: '' },
  );

  protected readonly page = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const raw = Number(params.get('page') ?? '1');
        return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
      }),
    ),
    { initialValue: 1 },
  );

  protected readonly loading = signal(false);
  protected readonly filteringImages = signal(false);
  protected readonly wakingServer = signal(false);
  protected readonly validatedOffers = signal<ProductOffer[]>([]);
  protected readonly sources = signal<Record<string, SearchSourceStatus>>({});
  protected readonly error = signal<string | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly exhausted = signal(false);

  protected readonly pageOffers = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.validatedOffers().slice(start, start + PAGE_SIZE);
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.validatedOffers().length / PAGE_SIZE)),
  );

  protected readonly canGoNext = computed(() => {
    if (this.filteringImages()) {
      return false;
    }

    if (this.page() * PAGE_SIZE < this.validatedOffers().length) {
      return true;
    }

    return !this.exhausted();
  });

  private searchGeneration = 0;
  private activeQuery = '';
  private nextWbPage = 1;
  private readonly seenOfferIds = new Set<string>();

  constructor() {
    effect(() => {
      void this.runSearch(this.query(), this.page());
    });
  }

  protected onSearch(query: string): void {
    void this.router.navigate(['/search'], { queryParams: { q: query, page: 1 } });
  }

  protected goToPage(page: number): void {
    const nextPage = Math.max(1, page);
    void this.router.navigate(['/search'], {
      queryParams: { q: this.query(), page: nextPage },
    });
  }

  protected showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(null), 2500);
  }

  protected sourceEntries(): [string, SearchSourceStatus][] {
    return Object.entries(this.sources());
  }

  protected sourceChipLabel(entry: [string, SearchSourceStatus]): string {
    const [name, status] = entry;
    let label = `${name}: ${status.status}`;
    if (status.count !== undefined) {
      label += ` (${status.count})`;
    }
    if (status.message) {
      label += ` — ${status.message}`;
    }
    return label;
  }

  protected onImageBroken(offerId: string): void {
    this.validatedOffers.update((offers) => offers.filter((offer) => offer.id !== offerId));
  }

  private async runSearch(query: string, page: number): Promise<void> {
    const generation = ++this.searchGeneration;

    if (query.length < 2) {
      this.resetState();
      return;
    }

    if (query !== this.activeQuery) {
      this.activeQuery = query;
      this.nextWbPage = 1;
      this.seenOfferIds.clear();
      this.validatedOffers.set([]);
      this.exhausted.set(false);
      this.sources.set({});
    }

    this.loading.set(this.validatedOffers().length === 0);
    this.wakingServer.set(
      environment.production && this.validatedOffers().length === 0,
    );
    this.error.set(null);

    try {
      await this.bffWarmup.warmup();
      if (generation !== this.searchGeneration) {
        return;
      }

      this.wakingServer.set(false);
      await this.ensureValidatedForPage(page, query, generation);
      if (generation !== this.searchGeneration) {
        return;
      }
    } catch (err) {
      if (generation !== this.searchGeneration) {
        return;
      }

      this.validatedOffers.set([]);
      this.error.set(
        formatHttpError(err, 'Не удалось выполнить поиск. Проверьте BFF на Render.'),
      );
    } finally {
      if (generation === this.searchGeneration) {
        this.wakingServer.set(false);
        this.loading.set(false);
        this.filteringImages.set(false);
      }
    }
  }

  private async ensureValidatedForPage(
    page: number,
    query: string,
    generation: number,
  ): Promise<void> {
    const needed = page * PAGE_SIZE;

    while (this.validatedOffers().length < needed && !this.exhausted()) {
      if (generation !== this.searchGeneration) {
        return;
      }

      this.filteringImages.set(true);
      const added = await this.fetchValidateBatch(query, generation);
      if (generation !== this.searchGeneration) {
        return;
      }

      if (added === 0) {
        this.exhausted.set(true);
        break;
      }
    }
  }

  private async fetchValidateBatch(query: string, generation: number): Promise<number> {
    const wbPage = this.nextWbPage;
    this.nextWbPage += 1;

    if (wbPage > MAX_WB_PAGES) {
      this.exhausted.set(true);
      return 0;
    }

    const response = await this.searchApi.search(query, wbPage);
    if (generation !== this.searchGeneration) {
      return 0;
    }

    if (wbPage === 1) {
      this.sources.set(response.sources);
    }

    const freshOffers = response.offers
      .map(normalizeOfferImageUrl)
      .filter((offer) => {
        if (this.seenOfferIds.has(offer.id)) {
          return false;
        }
        this.seenOfferIds.add(offer.id);
        return true;
      });

    if (freshOffers.length === 0) {
      this.exhausted.set(true);
      return 0;
    }

    const withImages = await filterOffersWithWorkingImages(freshOffers);
    if (generation !== this.searchGeneration) {
      return 0;
    }

    if (withImages.length > 0) {
      this.validatedOffers.update((current) => [...current, ...withImages]);
    }

    if (withImages.length === 0 && wbPage >= MAX_WB_PAGES) {
      this.exhausted.set(true);
    }

    return withImages.length;
  }

  private resetState(): void {
    this.activeQuery = '';
    this.nextWbPage = 1;
    this.seenOfferIds.clear();
    this.validatedOffers.set([]);
    this.sources.set({});
    this.error.set(null);
    this.exhausted.set(false);
  }
}

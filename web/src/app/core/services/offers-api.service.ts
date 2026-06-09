import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ImportFromUrlResponse } from '../models/import-from-url.model';

@Injectable({ providedIn: 'root' })
export class OffersApiService {
  private readonly http = inject(HttpClient);

  importFromUrl(url: string): Promise<ImportFromUrlResponse> {
    return firstValueFrom(
      this.http.post<ImportFromUrlResponse>('/api/offers/from-url', { url: url.trim() }),
    );
  }
}

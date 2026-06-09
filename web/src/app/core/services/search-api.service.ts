import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import { SearchResponse } from '../models/search-response.model';

const SEARCH_TIMEOUT_MS = 25_000;

@Injectable({ providedIn: 'root' })
export class SearchApiService {
  private readonly http = inject(HttpClient);

  search(query: string): Promise<SearchResponse> {
    const params = new HttpParams().set('q', query.trim());
    return firstValueFrom(
      this.http.get<SearchResponse>('/api/search', { params }).pipe(timeout(SEARCH_TIMEOUT_MS)),
    );
  }
}

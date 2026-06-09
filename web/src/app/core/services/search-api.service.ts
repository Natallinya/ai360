import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SearchResponse } from '../models/search-response.model';

@Injectable({ providedIn: 'root' })
export class SearchApiService {
  private readonly http = inject(HttpClient);

  search(query: string, wbPage = 1): Promise<SearchResponse> {
    let params = new HttpParams().set('q', query.trim());
    if (wbPage > 1) {
      params = params.set('wbPage', String(wbPage));
    }

    return firstValueFrom(
      this.http
        .get<SearchResponse>('/api/search', { params })
        .pipe(timeout(environment.searchTimeoutMs)),
    );
  }
}

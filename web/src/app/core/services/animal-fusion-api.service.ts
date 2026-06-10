import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import { AnimalFusionResponse, AnimalFusionStyle } from '../models/animal-fusion.model';
import { environment } from '../../../environments/environment';
import { apiUrl } from '../utils/api-url';

export interface FuseAnimalsPayload {
  animal1: string;
  animal2: string;
  style?: AnimalFusionStyle;
}

@Injectable({ providedIn: 'root' })
export class AnimalFusionApiService {
  private readonly http = inject(HttpClient);

  async fuseAnimals(payload: FuseAnimalsPayload): Promise<AnimalFusionResponse> {
    const response = await firstValueFrom(
      this.http
        .post<AnimalFusionResponse>('/api/animal-fusion', {
          animal1: payload.animal1.trim(),
          animal2: payload.animal2.trim(),
          style: payload.style ?? 'cute',
        })
        .pipe(timeout(environment.fusionTimeoutMs)),
    );

    return {
      ...response,
      imageUrl: apiUrl(response.imageUrl),
    };
  }
}

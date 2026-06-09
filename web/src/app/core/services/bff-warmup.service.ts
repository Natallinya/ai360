import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { apiUrl } from '../utils/api-url';

const WARMUP_STORAGE_KEY = 'ai360-bff-warmup-at';
const WARMUP_TTL_MS = 10 * 60_000;
const WARMUP_TIMEOUT_MS = 90_000;

@Injectable({ providedIn: 'root' })
export class BffWarmupService {
  private inFlight: Promise<void> | null = null;

  /** Будит Render (free tier засыпает) — вызывать при старте приложения и перед поиском. */
  warmup(): Promise<void> {
    if (!environment.production) {
      return Promise.resolve();
    }

    if (this.isRecentlyWarmed()) {
      return Promise.resolve();
    }

    if (!this.inFlight) {
      this.inFlight = this.pingHealth()
        .catch(() => undefined)
        .finally(() => {
          this.inFlight = null;
        });
    }

    return this.inFlight;
  }

  private isRecentlyWarmed(): boolean {
    try {
      const raw = localStorage.getItem(WARMUP_STORAGE_KEY);
      const ts = raw ? Number(raw) : 0;
      return Number.isFinite(ts) && Date.now() - ts < WARMUP_TTL_MS;
    } catch {
      return false;
    }
  }

  private async pingHealth(): Promise<void> {
    const response = await fetch(apiUrl('/api/health'), {
      signal: AbortSignal.timeout(WARMUP_TIMEOUT_MS),
    });

    if (response.ok) {
      localStorage.setItem(WARMUP_STORAGE_KEY, String(Date.now()));
    }
  }
}

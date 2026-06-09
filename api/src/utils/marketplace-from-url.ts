import { MarketplaceSource } from '../models/product-offer.model.js';

export function detectMarketplaceSource(hostname: string): MarketplaceSource {
  const host = hostname.toLowerCase();

  if (host.includes('wildberries.') || host === 'wb.ru') {
    return 'wildberries';
  }
  if (host.includes('allegro.')) {
    return 'allegro';
  }
  if (host.includes('market.yandex.') || host.includes('yandex.ru')) {
    return 'yandex-market';
  }

  return 'other';
}

/** Маркетплейсы, где простой fetch блокируется — нужен Playwright. */
export function needsPlaywrightFetch(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.includes('wildberries.') ||
    host === 'wb.ru' ||
    host.includes('allegro.') ||
    host.includes('market.yandex.')
  );
}

export function defaultCurrencyForSource(source: MarketplaceSource): string {
  switch (source) {
    case 'allegro':
      return 'PLN';
    case 'wildberries':
    case 'yandex-market':
      return 'RUB';
    default:
      return 'RUB';
  }
}

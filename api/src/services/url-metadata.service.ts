import { createHash } from 'node:crypto';

import { extractMetadataFromHtml } from '../parsers/metadata-from-html.js';
import { fetchPageWithPlaywright } from '../parsers/playwright-fetch.service.js';
import { blockedPageMessage, isBlockedMarketplacePage } from '../parsers/page-error.guards.js';
import { ImportFromUrlResponse, ProductOffer } from '../models/product-offer.model.js';
import {
  defaultCurrencyForSource,
  detectMarketplaceSource,
  needsPlaywrightFetch,
} from '../utils/marketplace-from-url.js';
import { assertSafePublicUrl } from '../utils/url-safety.js';

const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function importOfferFromUrl(rawUrl: string): Promise<ImportFromUrlResponse> {
  const parsedUrl = assertSafePublicUrl(rawUrl);
  const warnings: string[] = [];
  const source = detectMarketplaceSource(parsedUrl.hostname);
  const canonicalUrl = parsedUrl.toString();

  let meta;

  if (needsPlaywrightFetch(parsedUrl.hostname)) {
    warnings.push('Страница загружена через Playwright (headless браузер).');
    const { html } = await fetchPageWithPlaywright(canonicalUrl);
    meta = extractMetadataFromHtml(html);

    const title = meta.title?.trim() ?? '';
    if (!title || isBlockedMarketplacePage(title, html)) {
      throw new Error(blockedPageMessage(source));
    }
  } else {
    const html = await fetchHtmlWithFetch(parsedUrl);
    meta = extractMetadataFromHtml(html);
  }

  const currency = meta.currency ?? defaultCurrencyForSource(source);

  if (!meta.title) {
    warnings.push('Название не найдено — подставлен заголовок из URL.');
  }

  if (meta.price === undefined) {
    warnings.push('Цену не удалось извлечь — укажите вручную в форме ниже или на сайте магазина.');
  }

  if (!meta.imageUrl) {
    warnings.push('Изображение не найдено — используется заглушка.');
  }

  const slugTitle = parsedUrl.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
  const title = meta.title?.trim() || slugTitle || 'Товар по ссылке';

  const offer: ProductOffer = {
    id: `url-${createHash('sha256').update(canonicalUrl).digest('hex').slice(0, 16)}`,
    source,
    externalId: canonicalUrl,
    title,
    price: meta.price ?? 0,
    currency,
    imageUrl:
      meta.imageUrl ??
      'https://placehold.co/320x240/334155/e2e8f0?text=No+image',
    productUrl: canonicalUrl,
    availability: 'unknown',
    fetchedAt: new Date().toISOString(),
  };

  return { offer, warnings };
}

async function fetchHtmlWithFetch(parsedUrl: URL): Promise<string> {
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8,pl;q=0.7',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(
        `Магазин ответил кодом ${response.status}. Откройте ссылку в браузере и проверьте доступность.`,
      );
    }

    return await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    throw new Error(`Не удалось загрузить URL (${message}). Запущен ли BFF: npm run dev`);
  }
}

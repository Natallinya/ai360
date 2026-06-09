import * as cheerio from 'cheerio';

export interface ParsedMetadata {
  title?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
}

export function extractMetadataFromHtml(html: string): ParsedMetadata {
  const $ = cheerio.load(html);
  const meta: ParsedMetadata = {};

  meta.title = firstNonEmpty(
    $('meta[property="og:title"]').attr('content'),
    $('meta[name="twitter:title"]').attr('content'),
    $('title').text(),
  );

  meta.imageUrl = firstNonEmpty(
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('link[rel="image_src"]').attr('href'),
  );

  meta.price = parsePrice(
    $('meta[property="product:price:amount"]').attr('content'),
    $('meta[property="og:price:amount"]').attr('content'),
    $('meta[itemprop="price"]').attr('content'),
  );

  meta.currency = firstNonEmpty(
    $('meta[property="product:price:currency"]').attr('content'),
    $('meta[property="og:price:currency"]').attr('content'),
    $('meta[itemprop="priceCurrency"]').attr('content'),
  );

  if (meta.price === undefined) {
    meta.price = extractPriceFromJsonLd($);
  }

  if (meta.price === undefined) {
    meta.price = parsePrice($('.price_color').first().text());
  }

  if (meta.imageUrl?.startsWith('//')) {
    meta.imageUrl = `https:${meta.imageUrl}`;
  }

  return meta;
}

function extractPriceFromJsonLd($: cheerio.CheerioAPI): number | undefined {
  const scripts = $('script[type="application/ld+json"]');

  for (const element of scripts.toArray()) {
    const raw = $(element).html();
    if (!raw) {
      continue;
    }

    try {
      const data: unknown = JSON.parse(raw);
      const price = findPriceInJsonLd(data);
      if (price !== undefined) {
        return price;
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }

  return undefined;
}

function findPriceInJsonLd(node: unknown): number | undefined {
  if (!node || typeof node !== 'object') {
    return undefined;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const price = findPriceInJsonLd(item);
      if (price !== undefined) {
        return price;
      }
    }
    return undefined;
  }

  const record = node as Record<string, unknown>;

  if (record['@type'] === 'Product' || record['@type'] === 'Offer') {
    const fromOffers = findPriceInJsonLd(record['offers']);
    if (fromOffers !== undefined) {
      return fromOffers;
    }
  }

  if (typeof record['price'] === 'string' || typeof record['price'] === 'number') {
    return parsePrice(String(record['price']));
  }

  if (record['lowPrice'] !== undefined) {
    return parsePrice(String(record['lowPrice']));
  }

  for (const value of Object.values(record)) {
    const nested = findPriceInJsonLd(value);
    if (nested !== undefined) {
      return nested;
    }
  }

  return undefined;
}

function parsePrice(...values: (string | undefined)[]): number | undefined {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const match = normalized.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return Number(match[1]);
    }
  }

  return undefined;
}

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

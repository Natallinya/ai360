import { ProductOffer } from '../core/models/product-offer.model';

export function sampleOffer(overrides: Partial<ProductOffer> = {}): ProductOffer {
  return {
    id: 'offer-1',
    source: 'wildberries',
    externalId: '154349374',
    title: 'Термокружка 600 мл',
    price: 152,
    currency: 'RUB',
    imageUrl: 'https://example.com/img.jpg',
    productUrl: 'https://www.wildberries.ru/catalog/154349374/detail.aspx',
    availability: 'in_stock',
    fetchedAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  };
}

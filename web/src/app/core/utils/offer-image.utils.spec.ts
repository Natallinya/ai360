import { sampleOffer } from '../../testing/product-offer.fixture';
import { isPlaceholderImageUrl, normalizeOfferImageUrl } from './offer-image.utils';

describe('offer-image.utils', () => {
  it('detects placehold.co urls', () => {
    expect(isPlaceholderImageUrl('https://placehold.co/200x200')).toBe(true);
    expect(isPlaceholderImageUrl('https://example.com/a.jpg')).toBe(false);
  });

  it('rewrites wildberries image to wb-image proxy', () => {
    const offer = sampleOffer({
      imageUrl: 'https://images.wbstatic.net/154349374/pic.jpg',
    });
    const normalized = normalizeOfferImageUrl(offer);
    expect(normalized.imageUrl).toBe('/api/wb-image/154349374');
  });

  it('keeps non-wb offers unchanged', () => {
    const offer = sampleOffer({ source: 'mock', imageUrl: 'https://example.com/x.png' });
    expect(normalizeOfferImageUrl(offer).imageUrl).toBe('https://example.com/x.png');
  });
});

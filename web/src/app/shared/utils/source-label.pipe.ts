import { Pipe, PipeTransform } from '@angular/core';

import { MarketplaceSource } from '../../core/models/product-offer.model';

const LABELS: Record<MarketplaceSource, string> = {
  mock: 'Mock Market',
  'demo-store': 'Demo Store',
  dummyjson: 'DummyJSON (demo API)',
  wildberries: 'Wildberries',
  fusion: 'Гибрид',
  allegro: 'Allegro',
  'yandex-market': 'Яндекс Маркет',
  other: 'Другой магазин',
};

@Pipe({ name: 'sourceLabel', standalone: true })
export class SourceLabelPipe implements PipeTransform {
  transform(source: MarketplaceSource): string {
    return LABELS[source] ?? source;
  }
}

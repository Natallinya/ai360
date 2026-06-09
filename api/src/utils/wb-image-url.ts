const IMAGE_SIZE_PATHS = ['c516x688', 'c246x328', 'tm'] as const;

/** Номер basket-сервера по артикулу (алгоритм WB 2024–2025, по nmId). */
export function wbBasketNumber(nmId: number): number {
  if (nmId < 14_400_000) return 1;
  if (nmId < 28_800_000) return 2;
  if (nmId < 43_200_000) return 3;
  if (nmId < 72_000_000) return 4;
  if (nmId < 100_800_000) return 5;
  if (nmId < 106_200_000) return 6;
  if (nmId < 111_600_000) return 7;
  if (nmId < 117_000_000) return 8;
  if (nmId < 131_400_000) return 9;
  if (nmId < 160_200_000) return 10;
  if (nmId < 165_600_000) return 11;
  if (nmId < 185_400_000) return 12;
  if (nmId < 214_200_000) return 13;
  if (nmId < 243_000_000) return 14;
  if (nmId < 280_800_000) return 15;
  if (nmId < 318_600_000) return 16;
  if (nmId < 360_000_000) return 17;
  if (nmId < 405_000_000) return 18;
  if (nmId < 450_000_000) return 19;
  if (nmId < 495_000_000) return 20;
  if (nmId < 540_000_000) return 21;
  if (nmId < 585_000_000) return 22;
  if (nmId < 630_000_000) return 23;
  if (nmId < 675_000_000) return 24;
  if (nmId < 720_000_000) return 25;
  if (nmId < 765_000_000) return 26;
  if (nmId < 810_000_000) return 27;
  if (nmId < 855_000_000) return 28;
  if (nmId < 900_000_000) return 29;
  if (nmId < 945_000_000) return 30;
  return 31;
}

export function wbImagePath(nmId: number, basket: number, sizePath: string, imageNum = 1): string {
  const vol = Math.floor(nmId / 100_000);
  const part = Math.floor(nmId / 1_000);
  const basketStr = String(basket).padStart(2, '0');

  return `https://basket-${basketStr}.wbbasket.ru/vol${vol}/part${part}/${nmId}/images/${sizePath}/${imageNum}.webp`;
}

/** CDN-картинка товара WB по артикулу (nmId) — расчётный URL, может не существовать. */
export function wbProductImageUrl(nmId: number): string {
  return wbImagePath(nmId, wbBasketNumber(nmId), 'c516x688');
}

/** Кандидаты URL в порядке проверки: сначала расчётный, затем другие размеры и basket-серверы. */
export function wbProductImageUrlCandidates(nmId: number): string[] {
  const primaryBasket = wbBasketNumber(nmId);
  const seen = new Set<string>();
  const ordered: string[] = [];

  const add = (url: string) => {
    if (!seen.has(url)) {
      seen.add(url);
      ordered.push(url);
    }
  };

  for (const size of IMAGE_SIZE_PATHS) {
    add(wbImagePath(nmId, primaryBasket, size));
  }

  for (let basket = 1; basket <= 40; basket += 1) {
    if (basket === primaryBasket) {
      continue;
    }
    add(wbImagePath(nmId, basket, 'c516x688'));
  }

  return ordered;
}

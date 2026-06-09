/** Ссылки, которые стабильно парсятся с BFF (fetch + OG/meta, без антибота). */
export const TEST_PRODUCT_URLS = [
  {
    label: 'Книга — название, цена, картинка',
    url: 'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html',
  },
  {
    label: 'Книга — другой товар',
    url: 'https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html',
  },
  {
    label: 'Open Graph — meta title + image',
    url: 'https://ogp.me/',
  },
  {
    label: 'Демо-магазин — title + image (цена вручную)',
    url: 'https://webscraper.io/test-sites/e-commerce/allinone/product-page1/',
  },
] as const;

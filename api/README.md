# ai360-api (BFF)

Backend-for-Frontend для Wishlist Aggregator.

## Scripts

```bash
npm install
npm run playwright:install   # Chromium для WB/Allegro/Яндекс Маркет (импорт по URL)
npm run dev                  # http://localhost:4077
npm run build
npm start                    # production (dist/)
```

**Поиск:** Mock + Wildberries (`search.wb.ru`) + DummyJSON.

**Импорт по URL:** WB/Allegro/Яндекс → Playwright; остальные → fetch + cheerio.

# Добавить по ссылке

## Как работает

1. Пользователь вставляет URL товара (Ozon, Wildberries, Allegro, …).
2. BFF загружает HTML страницы (как браузер, с User-Agent).
3. Извлекаются `og:title`, `og:image`, цена из meta / JSON-LD.
4. Angular показывает предпросмотр → «Добавить в вишлист».

**Это не API маркетплейса** — только публичные meta-теги страницы. Юридически мягче, чем скрапинг каталога, но:

- сайт может блокировать запросы с сервера;
- цена часто не в meta → будет `0` и предупреждение;
- для некоторых магазинов понадобятся отдельные парсеры позже.

## API

```http
POST /api/offers/from-url
Content-Type: application/json

{ "url": "https://www.ozon.ru/product/..." }
```

Ответ:

```json
{
  "offer": { "id": "...", "source": "ozon", "title": "...", "price": 1990, ... },
  "warnings": ["Цену не удалось извлечь автоматически..."]
}
```

## UI

- Маршрут: `/add-by-url`
- Навигация: «По ссылке»

## Ограничения BFF

- Только `http` / `https`
- Запрещены localhost и private IP (защита от SSRF)
- Таймаут запроса: 12 с

## Тестовые ссылки (работают с BFF)

| Назначение | URL |
|------------|-----|
| **Рекомендуемая** (книга, title + цена) | https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html |
| Open Graph demo | https://ogp.me/ |

**Ozon / Wildberries / Allegro** загружаются через **Playwright** (headless Chromium) в Node BFF.

Первый раз после клонирования:

```powershell
cd D:\projects\ai360
npm install
npm run playwright:install
npm run dev
```

Если Chromium не установлен — ошибка с подсказкой `npx playwright install chromium`.

## Запуск

```powershell
cd D:\projects\ai360
npm install
npm run dev
```

Откройте http://localhost:4200/add-by-url

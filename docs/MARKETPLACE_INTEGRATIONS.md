# Интеграции с маркетплейсами

## Сводка для пэт-проекта

| Источник | Поиск для стороннего приложения | Ключи | Статус в ai360 |
|----------|-----------------------------------|-------|----------------|
| **Mock** | Да (демо RU) | Нет | ✅ Всегда |
| **DummyJSON** | Да (демо-каталог EN) | Нет | ✅ Без регистрации |
| **eBay Browse** | Да (sandbox/prod) | Sandbox Client ID/Secret | ⚙️ Опционально |
| **Allegro** `GET /offers/listing` | Только **верифицированные** приложения | OAuth | ❌ Новым приложениям доступ **не выдают** |
| **Allegro** `GET /sale/products` | Каталог продуктов, не цены с площадки | User OAuth (device/code) | ❌ Не подходит для вишлиста |
| **Ozon / WB / Allegro / др.** | Импорт по URL (meta/OG) | Нет | ✅ `POST /api/offers/from-url` |

## Allegro — почему не используем

Публичный поиск оферт: [`GET /offers/listing`](https://developer.allegro.pl/documentation/#tag/Public-offer-information/operation/getListing) — только для **zweryfikowanych aplikacji**. По ответам Allegro на GitHub (2025–2026) верификацию для новых приложений **приостановили** — стабильно приходит `403 VerificationRequired`.

`GET /sale/products` ищет в **каталоге продуктов Allegro**, а не «все предложения с ценами как на сайте», и требует токен **пользователя** (authorization code / device flow), не «просто ключ приложения».

**Итог:** для агрегатора вишлиста Allegro сейчас хуже, чем eBay, и не замена Ozon/WB.

## Что использовать вместо eBay / Allegro

1. **Mock** — запросы по-русски (`кружка`, `наушники`).
2. **DummyJSON** — живой HTTP API без ключей, запросы по-английски (`phone`, `laptop`, `watch`).
3. **«Добавить по ссылке»** — `/add-by-url`, BFF парсит Open Graph / JSON-LD со страницы товара.
4. **eBay** — когда получите ключи на [developer.ebay.com](https://developer.ebay.com/).

## DummyJSON

- Документация: https://dummyjson.com/docs/products
- Лимиты: разумное использование, без ключа.
- Это **учебный каталог**, не Allegro и не российские маркетплейсы — зато проверяет цепочку Angular → BFF → внешний API.

## eBay (опционально)

См. [BFF_EBAY_SETUP.md](./BFF_EBAY_SETUP.md).

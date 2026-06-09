# BFF и eBay Browse API (опционально)

> Allegro для публичного поиска оферт сейчас недоступен новым приложениям.  
> См. [MARKETPLACE_INTEGRATIONS.md](./MARKETPLACE_INTEGRATIONS.md) — mock, DummyJSON, «добавить по ссылке».

## Архитектура

```
Angular (web :4200)  --proxy /api-->  BFF (api :4077)  -->  eBay Browse API (sandbox)
                                              └──>  mock-каталог (всегда)
```

Секреты **только** в `api/.env`, не в Angular.

## Быстрый старт (два терминала)

**Терминал 1 — BFF:**

```powershell
cd D:\projects\ai360\api
copy .env.example .env
# заполните EBAY_CLIENT_ID и EBAY_CLIENT_SECRET (sandbox keys)
npm install
npm run dev
```

Проверка: http://localhost:4077/api/health

**Терминал 2 — Angular:**

```powershell
cd D:\projects\ai360\web
npm start
```

Поиск: http://localhost:4200/search?q=headphones

## Ключи eBay (sandbox)

1. Регистрация: https://developer.ebay.com/
2. **Application Keys** → **Sandbox** → Client ID + Client Secret
3. В `.env`:

```env
EBAY_CLIENT_ID=YourAppId-SBX-...
EBAY_CLIENT_SECRET=SBX-...
EBAY_SANDBOX=true
EBAY_MARKETPLACE_ID=EBAY_US
```

Без ключей работает только адаптер **mock** (статус `ebay: skipped` в выдаче).

## Production eBay

Для продакшена нужно одобрение eBay Buy API и ключи Production. Документация: https://developer.ebay.com/api-docs/buy/static/buy-requirements.html

## RU-маркетплейсы (Ozon, WB)

Публичного B2C API поиска для сторонних приложений **нет** (только Seller API для продавцов). Варианты на будущее: партнёрские программы, affiliate-фиды, «добавить по ссылке».

## API BFF

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/health` | Статус, `ebayConfigured` |
| GET | `/api/search?q=` | Агрегированный поиск |

Ответ `/api/search`:

```json
{
  "query": "headphones",
  "offers": [ ... ],
  "sources": {
    "mock": { "status": "ok", "count": 2 },
    "ebay": { "status": "ok", "count": 15 }
  }
}
```

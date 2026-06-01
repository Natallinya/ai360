# AGENTS.md — Wishlist Aggregator

## Продукт

Агрегатор вишлиста: пользователь ищет товар текстом, видит предложения с площадок, добавляет в личный список. Покупка — только по внешней ссылке.

Полная спецификация: [docs/PRODUCT_SPEC_wishlist_aggregator.md](docs/PRODUCT_SPEC_wishlist_aggregator.md).

## Репозиторий

| Путь | Назначение |
|------|------------|
| `web/` | Angular 21 SPA (zoneless, standalone, signals) |
| `docs/` | Продуктовая документация |
| `api/` | (план) Nest/Node BFF — ключи API только здесь |

## Команды (из `web/`)

```bash
npm start      # dev server :4200
npm run build
npm test       # Vitest
```

## Соглашения Angular

- Standalone components, `inject()`, OnPush
- Signals для UI-состояния; Reactive Forms для форм (не experimental Signal Forms без запроса)
- Feature folders: `web/src/app/features/<feature>/`
- Core: `web/src/app/core/` (services, models)
- Shared: `web/src/app/shared/` (UI primitives)

## MVP scope

- Поиск (mock-адаптер сначала)
- Страница результатов
- Вишлист (CRUD, localStorage → позже API)
- «Добавить по ссылке» — фаза 1.1

## Не делать без явного запроса

- Скрапинг Ozon/WB без легального API
- API keys в frontend
- Коммиты и push без запроса пользователя

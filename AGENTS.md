# AGENTS.md — Wishlist Aggregator

## Продукт

Агрегатор вишлиста: пользователь ищет товар текстом, видит предложения с площадок, добавляет в личный список. Покупка — только по внешней ссылке.

Полная спецификация: [docs/PRODUCT_SPEC_wishlist_aggregator.md](docs/PRODUCT_SPEC_wishlist_aggregator.md).  
User stories и статус: [docs/USER_STORIES.md](docs/USER_STORIES.md).

## Репозиторий

**GitHub:** https://github.com/Natallinya/ai360  
**Ветка для разработки:** `development` (не коммитить фичи напрямую в `main` без запроса).

| Путь | Назначение |
|------|------------|
| `web/` | Angular 21 SPA (zoneless, standalone, signals) |
| `docs/` | Продуктовая документация |
| `api/` | Express BFF — mock + DummyJSON; Playwright для Ozon/WB import; ключи в `api/.env` |

## Команды (из **корня** репозитория)

```bash
npm install    # workspaces: api + web
npm run dev    # BFF :4077 + Angular :4200
npm run build
npm test
```

## Соглашения Angular

**Полные правила для Cursor:** `.cursor/rules/angular-standards.mdc` (подхватываются при работе с `web/src/**`).

Кратко:

- UI-компоненты → папка `components/`, файлы `*.component.ts` (+ `.html`, `.scss`)
- Страницы с роутом → папка `pages/`, файлы `*.page.ts`
- Standalone, `inject()`, OnPush, signals; шаблоны — `@if` / `@for`
- Feature: `web/src/app/features/<feature>/` · core: `core/` · shared: `shared/`
- Reactive Forms (не experimental Signal Forms без запроса)

См. также: `.cursor/rules/angular-git-workflow.mdc`

## MVP scope

- Поиск (mock-адаптер сначала)
- Страница результатов
- Вишлист (CRUD, localStorage → позже API)
- «Добавить по ссылке» — `/add-by-url`, `POST /api/offers/from-url`

## Не делать без явного запроса

- Скрапинг Ozon/WB без легального API
- API keys в frontend
- Коммиты и push без запроса пользователя

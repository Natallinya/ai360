# Wishlist Aggregator (ai360)

**Репозиторий:** https://github.com/Natallinya/ai360

[![CI](https://github.com/Natallinya/ai360/actions/workflows/ci.yml/badge.svg)](https://github.com/Natallinya/ai360/actions/workflows/ci.yml)

Пэт-проект: поиск товаров и личный вишлист. **Монорепозиторий:** `api` (BFF) + `web` (Angular).

## Демо (после настройки CI/CD)

| | URL |
|---|-----|
| **Приложение** | https://natallinya.github.io/ai360/ |
| **BFF health** | https://ai360-bff.onrender.com/api/health |

Первый раз: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — включить GitHub Pages + подключить Render (~10 мин).

## Быстрый старт (одна команда)

```powershell
cd D:\projects\ai360
npm install
npm run playwright:install   # один раз — Chromium для Ozon/WB
npm run dev
```

- Angular: http://localhost:4200  
- BFF: http://localhost:4077 (прокси `/api` из Angular)

Отдельно при необходимости: `npm run dev:api` · `npm run dev:web`

### Порт 4200 занят

Старый `ng serve` всё ещё работает. В PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Или запустите Angular на другом порту:

```powershell
npm run start:4201 -w web
```

Откройте http://localhost:4201

## «Добавить по ссылке» — тестовая ссылка

Если Ozon/WB пишут **fetch failed** — это нормально: магазин блокирует сервер.

**Рабочая ссылка для проверки:**

https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html

На странице http://localhost:4200/add-by-url есть кнопки тестовых ссылок.

## Структура

```
ai360/
├── package.json      # npm workspaces, npm run dev
├── api/              # Express BFF
├── web/              # Angular 21
└── docs/
```

## Документация

- [Продуктовая спецификация](docs/PRODUCT_SPEC_wishlist_aggregator.md)
- [User stories — план и статус](docs/USER_STORIES.md)
- [Добавить по ссылке](docs/ADD_BY_URL.md)
- [Интеграции](docs/MARKETPLACE_INTEGRATIONS.md)
- [Бэкенд, парсеры, MCP](docs/BACKEND_PARSERS_AND_MCP.md)
- [Шпаргалка к докладу](docs/TALK_CURSOR_VIBE_CODING.md) · [журнал идей](docs/TALK_IDEAS_LOG.md)
- [AGENTS.md](AGENTS.md)

## Сборка и тесты

```powershell
npm run build
npm test
npm run build:pages   # сборка как для GitHub Pages
```

## CI/CD

- **CI** — каждый push/PR: сборка `api` + `web`, тесты.
- **CD** — push в `development` / `main`: фронт на GitHub Pages, BFF на Render (`render.yaml`).

Подробно: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Git

Разработка в ветке **`development`**. Репозиторий: https://github.com/Natallinya/ai360

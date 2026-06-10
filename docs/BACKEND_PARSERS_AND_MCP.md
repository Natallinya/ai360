# Бэкенд, парсеры и MCP — объяснение для проекта ai360

Документ для обучения: что у нас сейчас, какие есть пути к Ozon, что такое MCP (и чем он **не** является).

---

## 1. На каком языке наш бэкенд **сейчас**

| | |
|---|---|
| **Папка** | `api/` |
| **Язык** | **TypeScript** (компилируется в JavaScript) |
| **Рантайм** | **Node.js** 22 |
| **Фреймворк** | **Express** |
| **Парсинг HTML** | **cheerio** (как jQuery на сервере) |

Это слой **BFF** (Backend-for-Frontend): Angular ходит только в `/api`, секреты и тяжёлая логика — здесь.

```
Angular (web)  →  proxy /api  →  api/ (Node + TS)  →  внешние сайты / API
```

**Вы как фронтендер** уже в знакомой экосистеме: TypeScript, npm, JSON, async/await — как на фронте.

---

## 2. Python-парсеры — отдельная история

Многие «готовые парсеры Ozon/WB» на GitHub — это **Python**:

- `playwright` — реальный браузер без UI
- `curl_cffi` — запросы с отпечатком браузера (обход части антибота)
- `undetected-chromedriver` — Chrome под Selenium

Их **не ставят внутрь** Node-проекта как `npm install`. Обычно делают так:

### Вариант A — два сервиса (рекомендуем для обучения)

```
Angular → Node BFF (api/) → HTTP → Python scraper (scraper/)
                ↓
           mock, DummyJSON
```

- **Node** — маршруты, auth, вишлист в БД, единый API для фронта.
- **Python** — только «достань данные с Ozon по URL или запросу».

BFF вызывает: `POST http://localhost:5000/parse/ozon { "url": "..." }`.

### Вариант B — Playwright в Node ✅ (выбрано)

- Реализовано в `api/src/parsers/playwright-fetch.service.ts`
- Для Ozon/WB/Allegro/Я.Маркет — headless Chromium; для остальных — `fetch` + cheerio
- Установка браузера: `npm run playwright:install` из корня

### Вариант C — переписать BFF на Python (FastAPI)

- Имеет смысл, если вы целенаправленно учите Python.
- Минус: придётся переносить уже написанный `api/`.

**Практичный совет для ai360:** оставить **Node BFF**, добавить **`scraper/` на Python** только под Ozon/WB, когда дойдёте до этой фичи.

---

## 3. Ozon — что реально можно получить

| Способ | Легальность / стабильность | Поиск каталога | Одна карточка по URL |
|--------|---------------------------|----------------|----------------------|
| **Ozon Seller API** | Официально | ❌ только свои товары | ❌ |
| **Наш cheerio в BFF** | Публичная страница | ❌ блок | 🟡 часто `fetch failed` |
| **Python Playwright** | Серая зона (ToS Ozon) | 🟡 сложно | 🟡 реалистично для MVP |
| **Партнёрские / платные API** | По договору | 🟡 | 🟡 |
| **Пользователь вставляет URL вручную** | Ок | — | ✅ уже есть `/add-by-url` |

**Важно:** публичный **поиск** по всему Ozon без партнёрства — самая трудная задача. Для вишлиста чаще хватает **одной карточки по ссылке**, которую пользователь уже нашёл в браузере.

### Почему наш BFF падает на Ozon

Ozon отдаёт антибот: редиректы, проверка TLS/JS. Обычный `fetch` в Node — не браузер → `fetch failed` / `redirect count exceeded`.

### Что делают Python-парсеры

1. Запускают **Chromium** (Playwright).
2. Открывают URL товара как человек.
3. Ждут загрузки, читают DOM или внутренние JSON в странице.
4. Возвращают `{ title, price, image, url }`.

Пример стека (образовательно, [статья на Habr](https://habr.com/ru/companies/amvera/articles/960280/)): `playwright` + `aiohttp`.

**Риски пэт-проекта:**

- Ozon меняёт вёрстку → парсер ломается.
- Массовый парсинг может нарушать [правила Ozon](https://docs.ozon.ru/) — для вишлиста лучше **редкие запросы по URL пользователя**, не каталог.

---

## 4. Что такое MCP (и при чём тут Ozon)

**MCP = Model Context Protocol** — протокол, через который **Cursor (и другие AI-инструменты)** подключают **внешние инструменты для ассистента**.

Это **не** маркетплейс-API и **не** готовый парсер Ozon.

### MCP в вашем проекте

| MCP | Где | Зачем |
|-----|-----|--------|
| **angular-cli** | `.cursor/mcp.json` | Агент знает актуальный Angular 21 API, миграции, CLI |
| **github** | `.cursor/mcp.json` | Issues, PR, CI checks в репозитории `Natallinya/ai360` |
| **ai360-bff** | `mcp/ai360-bff/` + `.cursor/mcp.json` | Агент вызывает ваш BFF: health, search, fusion, wb-image |
| **ai360-rules** | `mcp/ai360-rules/` + `.cursor/mcp.json` | Запись правил в `.cursor/rules/*.mdc` по команде «Установи правило …» |
| **cursor-ide-browser** | Встроен в Cursor | Открыть localhost, клики, скриншоты для проверки UI |
| **cursor-app-control** | В Cursor | Правила, чат, workspace |
| **cursor-backend-control** | В Cursor | Автоматизации Cursor (не ваш BFF) |

Схема:

```
Вы в чате Cursor
      ↓
  AI-агент
      ↓
  MCP tools (github, angular-cli, ai360-bff, browser, …)
      ↓
  Действия: PR в GitHub, ng generate, GET /api/search, snapshot UI
```

**MCP не заменяет** написание `api/` или Python-scraper. Это «руки агента» в IDE.

### Настройка MCP (один раз)

1. **Собрать свой сервер:** `npm run build:mcp` (из корня монорепо).
2. **GitHub token:** в Windows — «Переменные среды» → `GITHUB_PERSONAL_ACCESS_TOKEN`  
   Scopes: `repo`, `read:org` (опционально). Токен **не** кладём в git.
3. **Cursor:** Settings → Tools & MCP — должны быть зелёные индикаторы у серверов из `.cursor/mcp.json`.
4. **Локальный BFF:** `npm run dev:api` (порт 3000). Для прода см. `.cursor/mcp.prod.example.json` (`AI360_BFF_URL=https://ai360.onrender.com`).

### Инструменты ai360-bff MCP

| Tool | BFF endpoint | Пример запроса агенту |
|------|--------------|------------------------|
| `bff_health` | `GET /api/health` | «Проверь, жив ли BFF» |
| `bff_search` | `GET /api/search?q=…` | «Найди наушники через BFF» |
| `bff_fuse_animals` | `POST /api/animal-fusion` | «Скрести медоед и носорог» |
| `bff_wb_image` | `GET /api/wb-image/:nmId` | «Проверь картинку WB 12345678» |

Код сервера: `mcp/ai360-bff/src/index.ts` — stdio-процесс, который Cursor запускает сам.

### Инструменты ai360-rules MCP (правила проекта)

| Tool | Действие | Пример в чате |
|------|----------|----------------|
| `rule_install` | Добавить/обновить секцию в **одном** файле `.cursor/rules/custom-rules.mdc` | «Установи правило „Не коммитить без спроса“: …» |
| `rule_list` | Список секций внутри `custom-rules.mdc` | «Какие мои правила есть?» |
| `rule_read` | Весь файл или одна секция по slug | «Покажи custom-rules» |

**Важно:** пользовательские правила из чата — **в одном файле** `custom-rules.mdc`.  
Стандарты Angular/git остаются в отдельных `angular-*.mdc`.  
Встроенный `cursor_dialog` — **глобальные** user rules Cursor; для ai360 лучше `custom-rules.mdc` в git.

Код: `mcp/ai360-rules/src/index.ts`

### Можно ли подключить MCP-парсер Ozon?

Теоретически — **свой** MCP-сервер на Python, который внутри вызывает Playwright. Но для приложения проще:

- **Scraper как HTTP-сервис** → BFF → Angular  
- MCP оставить для **разработки**, не для runtime пользователей.

---

## 5. Целевая архитектура с парсером Ozon (план)

```
┌─────────────┐     /api      ┌──────────────┐     /parse/ozon     ┌─────────────────┐
│  Angular    │ ────────────► │  Node BFF    │ ──────────────────► │ Python scraper  │
│  web/       │               │  api/        │                     │  scraper/       │
└─────────────┘               └──────────────┘                     └─────────────────┘
                                     │                                      │
                                     ├── mock, DummyJSON                    └── Playwright
                                     └── import URL (cheerio) ──► если Ozon → делегировать в Python
```

### Эндпоинты (план)

| Метод | Кто | Назначение |
|-------|-----|------------|
| `POST /api/offers/from-url` | Node | Уже есть; для ozon.ru → прокси в Python |
| `POST /parse/ozon` | Python | `{ "url": "https://www.ozon.ru/product/..." }` → `ProductOffer` |
| `GET /api/search?q=` | Node | Без изменений |

### Что установить (когда дойдёте до Python)

```powershell
cd scraper
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn playwright
playwright install chromium
```

Минимальный FastAPI:

```python
# scraper/main.py — концепт, не в репо пока
from fastapi import FastAPI
app = FastAPI()

@app.post("/parse/ozon")
async def parse_ozon(body: dict):
    url = body["url"]
    # playwright: открыть url, извлечь title, price, image
    return {"title": "...", "price": 0, "imageUrl": "...", "productUrl": url}
```

Node BFF в `url-metadata.service.ts` для `ozon.ru`:

```typescript
// если hostname includes ozon → fetch('http://localhost:5000/parse/ozon', ...)
```

---

## 6. Что выбрать **вам** (фронтенд + обучение Cursor)

| Цель | Действие |
|------|----------|
| Понять текущий бэк | Читать `api/src/`, запускать `npm run dev:api` |
| Не плодить языки сразу | Попробовать **Playwright в Node** для одного URL Ozon |
| Учить Python | Папка `scraper/` + FastAPI, BFF только проксирует |
| Легально и стабильно | «По ссылке» + ручная цена (US-E4), без каталога Ozon |
| Доклад | Слайд «три слоя: Angular / Node BFF / парсер» + честно про ToS |

---

## 7. Промпты для следующих шагов в Cursor

1. «Добавь папку `scraper/` с FastAPI и Playwright: парсинг одной карточки Ozon по URL»
2. «В `api` для ozon.ru делегируй в Python scraper, для остальных — cheerio»
3. «Добавь в docker-compose api + scraper + web для одной команды `docker compose up`»
4. «Реализуй US-E4: ручной ввод цены, если парсер вернул 0»

---

## 8. Ссылки

- Наш BFF: `api/README.md`
- Импорт по URL: `docs/ADD_BY_URL.md`
- Интеграции: `docs/MARKETPLACE_INTEGRATIONS.md`
- [Ozon Seller API](https://docs.ozon.ru/api/seller/) — не для поиска каталога
- [Playwright Node](https://playwright.dev/docs/intro)
- [Playwright Python](https://playwright.dev/python/docs/intro)
- [Angular MCP](https://angular.dev/ai/mcp)
- [Cursor MCP docs](https://docs.cursor.com/context/mcp)

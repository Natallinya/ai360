# Wishlist Aggregator (ai360)

Пэт-проект: поиск товаров с маркетплейсов и личный вишлист.

## Документация

- [Продуктовая спецификация](docs/PRODUCT_SPEC_wishlist_aggregator.md)
- [AGENTS.md](AGENTS.md) — контекст для Cursor / AI

## Структура репозитория

```
ai360/
├── docs/          # BA, спецификации
├── web/           # Angular 21 (frontend)
└── (позже) api/   # BFF / backend для поиска и ключей API
```

## Быстрый старт

```powershell
cd web
npm start
```

Откройте http://localhost:4200

## Сборка и тесты

```powershell
cd web
npm run build
npm test
```

## GitHub

1. Создайте пустой репозиторий на https://github.com/new (без README, если уже есть локальный git).
2. В корне `ai360`:

```powershell
git init
git add .
git commit -m "chore: initial Angular 21 scaffold and product spec"
git branch -M main
git remote add origin https://github.com/Natallinya/ai360.git
git push -u origin main
```

## Следующие шаги разработки

1. MVP-экраны: поиск, результаты, вишлист (`web/src/app/features/`)
2. Mock-адаптер поиска + сервис вишлиста (localStorage)
3. BFF (`api/`) — когда понадобятся секреты внешних API
4. GitHub Actions — CI на `web/` (build + test)

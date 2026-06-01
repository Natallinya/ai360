# Wishlist Aggregator (ai360)

**Репозиторий:** https://github.com/Natallinya/ai360

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

## Git и ветки

| Ветка | Назначение |
|-------|------------|
| `main` | Стабильная версия (релизы, merge из `development`) |
| `development` | Ежедневная разработка |

**Репозиторий:** https://github.com/Natallinya/ai360

```powershell
# Клонирование и переход на development
git clone https://github.com/Natallinya/ai360.git
cd ai360
git checkout development

# Обычный цикл разработки
git checkout development
git pull
# ... правки ...
git add .
git commit -m "feat: описание изменения"
git push

# Когда готово к релизу — Pull Request: development → main
```

## Следующие шаги разработки

1. MVP-экраны: поиск, результаты, вишлист (`web/src/app/features/`)
2. Mock-адаптер поиска + сервис вишлиста (localStorage)
3. BFF (`api/`) — когда понадобятся секреты внешних API
4. GitHub Actions — CI на `web/` (build + test)

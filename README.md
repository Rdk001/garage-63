# Garage 63

Современный адаптивный одностраничный сайт для автосервиса с рабочей формой заявки и отправкой обращений в Telegram.

Проект может использоваться как готовая основа для автосервиса, СТО, детейлинг-центра или мастерской.

## Возможности

- адаптивная вёрстка для компьютеров, планшетов и смартфонов;
- HTML / CSS / Vanilla JavaScript без тяжёлых фреймворков;
- форма записи на обслуживание;
- отправка заявок в Telegram;
- Cloudflare Worker в качестве backend;
- валидация формы на frontend и backend;
- форматирование российского номера телефона;
- защита формы от простых спам-ботов через honeypot;
- CORS;
- обработка ошибок Telegram API;
- таймаут запросов;
- защита от повторного нажатия кнопки во время отправки;
- режимы `showcase` и `production`;
- безопасное хранение Telegram-токена через Cloudflare Secrets;
- готовность к размещению на GitHub Pages или другом статическом хостинге.

---

## Структура проекта

```text
garage-63/
│
├── .github/             # GitHub Actions
├── css/                 # Стили сайта
├── js/
│   └── main.js          # Frontend-логика
├── worker/
│   └── index.js         # Cloudflare Worker
│
├── favicon.ico
├── index.html
├── README.md
├── site.json
├── sitemap.xml
├── theme.css
└── wrangler.jsonc
```

## Быстрый запуск

Frontend не требует сборки.

Для локального просмотра можно открыть проект через локальный HTTP-сервер, например Live Server в VS Code.

Для публикации подойдут:

- GitHub Pages;
- Cloudflare Pages;
- Netlify;
- Vercel;
- обычный статический хостинг.

## Настройка сайта

Основные параметры находятся в `site.json`.

Пример:

```json
{
  "mode": "production",
  "apiEndpoint": "https://YOUR-WORKER.workers.dev/api/contact",
  "contacts": {
    "phoneHref": "tel:+79990000000",
    "telegramHref": "https://t.me/username"
  }
}
```

### Production

Для рабочего сайта:

```json
"mode": "production"
```

Укажите адрес Cloudflare Worker:

```json
"apiEndpoint": "https://YOUR-WORKER.workers.dev/api/contact"
```

### Showcase

Для демонстрационного режима:

```json
"mode": "showcase"
```

В этом режиме форма не отправляет реальные данные.

## Контакты

Контакты задаются в `site.json`.

```json
"contacts": {
  "phoneHref": "tel:+79990000000",
  "telegramHref": "https://t.me/username"
}
```

Если контакт пока не используется:

```json
"contacts": {
  "phoneHref": "",
  "telegramHref": ""
}
```

## Форма заявки

Форма отправляет:

- имя;
- телефон;
- выбранную услугу;
- комментарий.

После успешной отправки заявка поступает в Telegram.

## Защита формы

Реализованы:

- frontend и backend валидация;
- проверка российского номера телефона;
- ограничения длины полей;
- проверка JSON;
- проверка `Content-Type`;
- CORS;
- honeypot-защита от простых ботов;
- проверка ответа Telegram API;
- таймаут запросов.

## Cloudflare Worker

Backend находится в:

```text
worker/index.js
```

Worker принимает:

```text
POST /api/contact
```

и отправляет заявку через Telegram Bot API.

## Wrangler

Wrangler можно запускать через `npx`:

```powershell
npx wrangler --version
```

Для входа в Cloudflare:

```powershell
npx wrangler login
```

## Telegram

Создайте Telegram-бота через `@BotFather`.

Полученные секреты нельзя хранить во frontend или публичном репозитории.

Добавьте Bot Token:

```powershell
npx wrangler secret put BOT_TOKEN
```

Добавьте Chat ID:

```powershell
npx wrangler secret put CHAT_ID
```

Проверить список настроенных секретов:

```powershell
npx wrangler secret list
```

## Разрешённый домен

В `wrangler.jsonc` укажите домен сайта:

```jsonc
{
  "name": "garage-63-api",
  "main": "worker/index.js",
  "compatibility_date": "2026-08-12",
  "vars": {
    "ALLOWED_ORIGINS": "https://example.com"
  }
}
```

Для нескольких origins:

```json
"ALLOWED_ORIGINS": "https://example.com,https://www.example.com"
```

После изменения домена Worker необходимо задеплоить заново.

## Проверка Worker

Dry-run:

```powershell
npx wrangler deploy --dry-run
```

Deploy:

```powershell
npx wrangler deploy
```

После публикации Cloudflare выдаст адрес:

```text
https://your-worker.workers.dev
```

Для формы используется:

```text
https://your-worker.workers.dev/api/contact
```

Его необходимо указать в `site.json`.

## Публикация frontend

При использовании GitHub Pages укажите origin сайта в `ALLOWED_ORIGINS`.

Пример:

```json
"ALLOWED_ORIGINS": "https://username.github.io"
```

После изменения выполните:

```powershell
npx wrangler deploy
```

## Что изменить перед запуском сайта клиента

Замените:

- название компании;
- логотип;
- фотографии;
- тексты;
- услуги;
- цены;
- отзывы;
- адрес;
- режим работы;
- телефон;
- Telegram;
- SEO title и description;
- домен;
- `ALLOWED_ORIGINS`;
- URL Worker;
- Telegram `BOT_TOKEN`;
- Telegram `CHAT_ID`.

## Безопасность

Никогда не публикуйте:

```text
BOT_TOKEN
CHAT_ID
API keys
пароли
.env
приватные ключи
```

Backend-секреты должны храниться в Cloudflare Worker Secrets.

## Технологии

Frontend:

```text
HTML5
CSS3
Vanilla JavaScript
```

Backend:

```text
Cloudflare Workers
Telegram Bot API
```

Deployment:

```text
GitHub Pages
Cloudflare Workers
```

## Передача проекта клиенту

Для переноса проекта на аккаунты клиента:

1. передайте frontend;
2. войдите в Cloudflare-аккаунт клиента;
3. настройте `BOT_TOKEN`;
4. настройте `CHAT_ID`;
5. измените `ALLOWED_ORIGINS`;
6. выполните `npx wrangler deploy`;
7. вставьте новый Worker URL в `site.json`;
8. добавьте реальные контакты;
9. отправьте тестовую заявку.

После этого сайт не зависит от аккаунтов первоначального разработчика.

## Лицензирование

Перед коммерческой передачей отдельно проверьте права на изображения, тексты и другие материалы, используемые в конкретной версии сайта.

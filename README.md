<div align="center">

# ✦ Iskra

**Знайомства, які починаються зі щирості.**

Легкий сайт знайомств на чистому HTML/CSS/JS — без фреймворків, без збірки —
з мок-API, готовим до заміни на реальний бекенд і базу даних.

[![Deploy to GitHub Pages](https://img.shields.io/badge/deploy-github%20pages-6B4E71)](#-деплой)
[![License: MIT](https://img.shields.io/badge/license-MIT-F2C14E)](LICENSE)
[![Made with Vanilla JS](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-FF6F5E)](#-стек)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-2B1B2E)](CONTRIBUTING.md)

</div>

---

## Зміст

- [Про проєкт](#про-проєкт)
- [Демо](#демо)
- [Стек](#-стек)
- [Швидкий старт](#швидкий-старт)
- [Структура проєкту](#структура-проєкту)
- [Архітектура даних](#архітектура-даних)
- [Підключення бази даних](#підключення-бази-даних)
- [Деплой](#-деплой)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Ліцензія](#ліцензія)

## Про проєкт

Iskra — навчальний / стартовий шаблон сайту знайомств. Замість нескінченного
свайпу показує чесний відсоток сумісності ("іскри") для кожної анкети та
відкриває чат тільки після взаємного лайку.

**Ключові фічі:**

- 📝 Реєстрація та вхід (форми з валідацією)
- 🔥 Стрічка анкет із drag-свайпом (мишею й тачем)
- ✦ Індикатор сумісності на кожній картці
- 💬 Метчі та чат між взаємними лайками
- 🧩 Чіткий поділ UI / API-шару — легко підмінити мок на реальний бекенд

## Демо

> Відкрий `src/index.html` у браузері — або запусти локально (нижче) чи через
> GitHub Pages після деплою.

Демо-акаунти (пароль скрізь `1234`):

| Email | Ім'я |
|---|---|
| `marta@example.com` | Марта |
| `taras@example.com` | Тарас |
| `olya@example.com` | Оля |
| `bogdan@example.com` | Богдан |
| `iryna@example.com` | Ірина |

## 🧱 Стек

- **HTML5** — семантична розмітка, без залежностей
- **CSS3** — кастомні властивості (design tokens), без препроцесорів
- **Vanilla JavaScript (ES2020+)** — без React/Vue, без збірника
- **Мок-API в пам'яті** (`src/js/api.js`) — імітує REST-ендпоінти, готовий до заміни на `fetch()`

## Швидкий старт

```bash
git clone https://github.com/<your-username>/iskra.git
cd iskra
npm install
npm start
```

Відкриється `http://localhost:5173`. Можна й без Node — просто відкрий
`src/index.html` подвійним кліком.

## Структура проєкту

```
iskra/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml         — лінт HTML на кожен PR
│   │   └── deploy.yml     — автодеплой на GitHub Pages
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── DATABASE.md        — детальна інструкція підключення БД
├── src/
│   ├── index.html         — розмітка всіх екранів
│   ├── css/
│   │   └── style.css      — дизайн-токени та стилі
│   └── js/
│       ├── api.js         — API-шар (зараз мок, готовий до fetch())
│       └── app.js         — логіка інтерфейсу (свайпи, таби, чат)
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

## Архітектура даних

UI (`app.js`) **ніколи не працює з даними напряму** — тільки через функції з
`api.js`: `register()`, `login()`, `getProfiles()`, `swipe()`, `getMatches()`,
`getMessages()`, `sendMessage()`. Завдяки цьому підміна мок-даних на реальні
запити до бекенду не вимагає змін в інтерфейсі.

```
app.js  →  api.js  →  [ зараз: масиви в пам'яті ]
                   →  [ завтра: fetch('/api/...') → бекенд → БД ]
```

## Підключення бази даних

Повна інструкція зі схемою таблиць PostgreSQL, прикладом Express-сервера та
конкретними рядками для заміни в `api.js` — у **[docs/DATABASE.md](docs/DATABASE.md)**.

## 🚀 Деплой

У репозиторії вже є `.github/workflows/deploy.yml`. Щоб увімкнути:

1. Push у гілку `main`.
2. У налаштуваннях репозиторію: **Settings → Pages → Source → GitHub Actions**.
3. Workflow сам збере `src/` і опублікує сайт на `https://<username>.github.io/iskra/`.

## Roadmap

- [ ] Реальний бекенд (Node/Express) + PostgreSQL — див. `docs/DATABASE.md`
- [ ] WebSocket для чату в реальному часі
- [ ] Завантаження фото профілю
- [ ] Фільтри стрічки (вік, місто, інтереси)
- [ ] Push-сповіщення про нові метчі
- [ ] Тести (Playwright / Vitest)

## Contributing

Пул-реквести вітаються! Дивись **[CONTRIBUTING.md](CONTRIBUTING.md)** —
там локальний запуск, структура коду та правила для PR.

## Ліцензія

Розповсюджується під ліцензією **MIT** — див. **[LICENSE](LICENSE)**.

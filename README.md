# Клуб мобильного монтажа в Alight Motion

Лендинг закрытого Telegram-клуба по мобильному монтажу в Alight Motion. Это чистый HTML, CSS и JavaScript: сборка и зависимости не нужны.

## Структура

```
index.html              — страница сайта
assets/css/styles.css   — стили
assets/js/config.js     — тексты, цена и ссылка на Telegram
assets/js/main.js       — анимации и интерактив
assets/img/             — иконка приложения
assets/video/hero.mp4   — видео на экране телефона
assets/favicon.svg      — иконка вкладки
```

## Как поменять контент

Почти всё редактируется в `assets/js/config.js`:

- `TELEGRAM_URL` — куда ведут все кнопки «Вступить в клуб»;
- `SITE.clubName`, `SITE.authorName` — название клуба и имя автора;
- `testimonials` — отзывы;
- `faq` — вопросы и ответы (в последнем вопросе нужно указать срок обратной связи).

## Публикация на GitHub Pages

1. Settings → Pages.
2. Source: **Deploy from a branch**, ветка `main`, папка `/ (root)`.
3. Сохранить. Через 1–2 минуты сайт откроется по адресу `https://<логин>.github.io/<имя-репозитория>/`.

## Локальный просмотр

Откройте `index.html` в браузере.

# 🔥 Ужарка - Калькулятор потерь веса

Веб-приложение для расчета потерь веса при приготовлении продуктов (ужарка, уварка).

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск локального сервера разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для продакшена
```bash
npm run build
```

### Предварительный просмотр сборки
```bash
npm run preview
```

## 📋 Функционал

- **Три режима расчета:**
  - Ужарка (потеря веса)
  - Уварка (увеличение веса)
  - Целевой вес (расчет по проценту потери)

- **Журнал записей** с сохранением в localStorage

- **Экспорт данных:**
  - JSON (резервное копирование)
  - Excel (.xlsx)
  - PDF (отчетный документ)

- **Печать** журнала с оптимизированными стилями

- **Темная/светлая тема** с автоопределением системных настроек

- **Адаптивный дизайн** для мобильных устройств

## 🏗️ Архитектура проекта

```
uzharka/
├── index.html          # HTML-разметка
├── styles.css          # CSS-стили
├── script.js           # JavaScript-логика (модульная)
├── vite.config.js      # Конфигурация Vite
├── netlify.toml        # Настройки деплоя Netlify
├── package.json        # Зависимости и скрипты
└── README.md           # Документация
```

## ☁️ Деплой на Netlify

### Автоматический деплой (рекомендуется)

1. Создайте репозиторий на GitHub/GitLab
2. Запушьте код:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
3. В панели Netlify:
   - Нажмите "New site from Git"
   - Выберите ваш репозиторий
   - Netlify автоматически обнаружит настройки из `netlify.toml`
   - Нажмите "Deploy site"

### Ручной деплой через CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 🔌 Подготовка к подключению БД

Модуль `StorageModule` в `script.js` разработан с возможностью легкой замены localStorage на API:

```javascript
// Текущая реализация (localStorage)
const StorageModule = {
    getAll() { /* ... */ },
    add(entry) { /* ... */ },
    clear() { /* ... */ }
};

// Для подключения Supabase/Firebase замените методы на API-вызовы
// Пример для Supabase:
// const { createClient } = require('@supabase/supabase-js')
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

## 📦 Используемые библиотеки

- **Vite** - сборщик и dev-сервер
- **SheetJS (XLSX)** - экспорт в Excel
- **jsPDF** - генерация PDF
- **html2canvas** - скриншоты для PDF

## 🎨 Темизация

Приложение использует CSS Custom Properties для тем:

```css
:root {
    --bg-primary: #ffffff;
    --text-primary: #333333;
    --accent-color: #ff6b35;
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
}
```

## 📱 Поддержка браузеров

- Chrome (последние версии)
- Firefox (последние версии)
- Safari (последние версии)
- Edge (последние версии)
- Мобильные браузеры (iOS Safari, Chrome Mobile)

## 📄 Лицензия

ISC

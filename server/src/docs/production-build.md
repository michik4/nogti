# Работа с продакшн сборкой CLI инструментов

## Обзор

Система CLI инструментов поддерживает автоматический выбор между TypeScript исходниками (для разработки) и скомпилированными JavaScript файлами (для продакшена).

## Сборка проекта

### Полная сборка
```bash
npm run build
```

### Сборка с отслеживанием изменений
```bash
npm run build:watch
```

## Структура файлов

### Исходники (src/)
```
src/
├── cli/
│   ├── cli-runner.ts    # Универсальная CLI обертка
│   ├── env.cli.ts       # CLI для работы с .env
│   └── db.cli.ts        # CLI для базы данных
├── index.ts             # Основной файл сервера
└── ...
```

### Сборка (dist/)
```
dist/
├── cli/
│   ├── cli-runner.js    # Скомпилированная CLI обертка
│   ├── env.cli.js       # Скомпилированный env CLI
│   └── db.cli.js        # Скомпилированный db CLI
├── index.js             # Скомпилированный сервер
└── ...
```

## Автоматический выбор версии

CLI обертка (`cli-runner.ts`) автоматически выбирает правильную версию:

1. **Приоритет 1**: `dist/cli/*.cli.js` (скомпилированные файлы)
2. **Приоритет 2**: `src/cli/*.cli.js` (если есть JS файлы в src)
3. **Приоритет 3**: `src/cli/*.cli.ts` (TypeScript исходники)

## Команды для разных окружений

### Разработка (Development)
```bash
# Используют TypeScript исходники с ts-node
npm run env get PORT
npm run db migration:status
```

### Продакшн (Production)
```bash
# Сначала собираем проект
npm run build

# Затем используем те же команды (автоматически выберутся JS файлы)
npm run env get PORT
npm run db migration:status
```

## Прямые команды через скрипты

### Windows (scripts/env.cmd)
```batch
@echo off
if exist "dist\cli\env.cli.js" (
    node dist\cli\env.cli.js %*
) else (
    npx ts-node --transpile-only src/cli/env.cli.ts %*
)
```

### Unix/Linux (scripts/env.sh)
```bash
#!/bin/bash
if [ -f "dist/cli/env.cli.js" ]; then
    node dist/cli/env.cli.js "$@"
else
    npx ts-node --transpile-only src/cli/env.cli.ts "$@"
fi
```

## Примеры использования

### Локальная разработка
```bash
# Работаем с исходниками TypeScript
npm run env create
npm run env set NODE_ENV development
npm run env list
```

### Подготовка к деплою
```bash
# Сборка проекта
npm run build

# Проверка работы со сборкой
npm run env validate
npm run db migration:status

# Запуск продакшн сервера
npm start
```

### В продакшене
```bash
# После загрузки кода на сервер
npm ci --only=production
npm run build

# Настройка окружения
./scripts/env.cmd set NODE_ENV production
./scripts/env.cmd set DB_HOST prod-db-server
./scripts/env.cmd set JWT_SECRET production-secret

# Запуск миграций
npm run db migration:run

# Запуск сервера
npm start
```

## Оптимизация для продакшена

### 1. Исключение TypeScript из продакшена
```bash
# Установка только production зависимостей
npm ci --only=production
```

### 2. Использование PM2 (рекомендуется)
```json
{
  "name": "prometai-server",
  "script": "dist/index.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. CLI команды в продакшене
```bash
# Используйте скомпилированные версии напрямую
node dist/cli/env.cli.js get PORT
node dist/cli/db.cli.js migration:run
```

## Деплой процесс

### Dockerfile пример
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем все зависимости для сборки
RUN npm ci

# Копируем исходники
COPY src/ ./src/
COPY tsconfig.json ./

# Собираем проект
RUN npm run build

# Удаляем dev зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем .env если нужно
COPY .env ./

EXPOSE 3000

CMD ["npm", "start"]
```

## Проверка сборки

### Валидация CLI после сборки
```bash
# Проверяем, что CLI работают со сборкой
npm run build
npm run env validate
npm run db help

# Проверяем основной сервер
npm start
```

### Отладка проблем
```bash
# Проверяем существование файлов сборки
ls -la dist/cli/

# Проверяем права доступа (Unix)
chmod +x scripts/*.sh

# Тестируем прямой вызов
node dist/cli/env.cli.js help
```

## Бест практики

1. **Всегда собирайте проект перед деплоем**
2. **Тестируйте CLI команды после сборки**
3. **Используйте `npm ci` вместо `npm install` в продакшене**
4. **Сохраняйте .env в безопасном месте**
5. **Используйте отдельные конфигурации для разных окружений** 
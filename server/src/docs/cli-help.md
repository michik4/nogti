# 🛠️ Prometai Server CLI Tools - Справочник

## Общий обзор

Набор консольных утилит для управления сервером Prometai, включая работу с переменными окружения и базой данных.

## Основные команды

### 🎯 Быстрый старт

```bash
# Показать общую справку
npm run cli help
npm run cli:help

# Справка по конкретному инструменту
npm run env:help
npm run db:help
```

## 📋 ENV CLI - Управление переменными окружения

### Создание и настройка

```bash
# Создать новый .env файл с шаблоном
npm run env:create

# Создать шаблон .env.template
npm run cli env template

# Скопировать .env из другого файла
npm run cli env copy .env.example
```

### Просмотр переменных

```bash
# Показать все переменные (с сокрытием паролей)
npm run env:list

# Получить конкретную переменную (чистый вывод)
npm run -s env:get PORT
# Выведет: PORT=3000

# Получить переменную с npm wrapper
npm run env:get NODE_ENV
```

### Изменение переменных

```bash
# Установить переменную
npm run env:set PORT 3000
npm run env:set NODE_ENV production
npm run env:set DB_PASSWORD "secure_password"

# Удалить переменную
npm run cli env delete OLD_VARIABLE
npm run cli env del UNUSED_KEY
```

### Управление файлами

```bash
# Создать резервную копию
npm run cli env backup
# Создаст файл .env.backup.2024-01-15T10-30-00-000Z

# Восстановить из резервной копии
npm run cli env restore .env.backup.2024-01-15T10-30-00-000Z

# Проверить корректность .env файла
npm run env:validate
```

### Интерактивный режим

```bash
# Запустить интерактивное редактирование
npm run cli env edit
```

## 🗄️ DB CLI - Управление базой данных

### Миграции

```bash
# Показать статус миграций
npm run cli db migration:status

# Выполнить все ожидающие миграции
npm run cli db migration:run

# Откатить последнюю миграцию
npm run cli db migration:revert

# Создать новую миграцию на основе изменений в сущностях
npm run cli db migration:generate CreateUsersTable

# Создать пустую миграцию
npm run cli db migration:create AddIndexToUsers
```

### Сиды (Seeds)

```bash
# Выполнить все сиды
npm run cli db seed:run

# Выполнить конкретный сид
npm run cli db seed:run users

# Показать статус сидов
npm run cli db seed:status

# Сбросить все сиды
npm run cli db seed:reset
```

### Управление базой данных

```bash
# Удалить все таблицы
npm run cli db db:drop

# Создать схему базы данных
npm run cli db db:create

# Полный сброс (удаление + миграции + сиды)
npm run cli db db:reset
```

## 🚀 Примеры сценариев использования

### Начальная настройка проекта

```bash
# 1. Создаем .env файл
npm run env:create

# 2. Настраиваем основные переменные
npm run env:set NODE_ENV development
npm run env:set PORT 3000
npm run env:set DB_PASSWORD "mypassword"

# 3. Проверяем настройки
npm run env:validate
npm run env:list

# 4. Настраиваем базу данных
npm run cli db db:create
npm run cli db migration:run
npm run cli db seed:run
```

### Деплой в продакшн

```bash
# 1. Создаем резервную копию текущих настроек
npm run cli env backup

# 2. Настраиваем продакшн переменные
npm run env:set NODE_ENV production
npm run env:set DB_HOST prod-db-server
npm run env:set JWT_SECRET "production-secret-key"

# 3. Сборка проекта
npm run build

# 4. Применяем миграции
npm run cli db migration:run

# 5. Проверяем готовность
npm run env:validate
npm run cli db migration:status
```

### Разработка новой функции

```bash
# 1. Создаем миграцию для новой таблицы
npm run cli db migration:generate AddNotificationsTable

# 2. Применяем миграцию
npm run cli db migration:run

# 3. Добавляем тестовые данные
npm run cli db seed:run notifications

# 4. При необходимости откатываем изменения
npm run cli db migration:revert
```

### Смена окружения разработки

```bash
# 1. Сохраняем текущие настройки
npm run cli env backup

# 2. Копируем настройки другого окружения
npm run cli env copy .env.staging

# 3. Адаптируем под локальную разработку
npm run env:set DB_HOST localhost
npm run env:set NODE_ENV development

# 4. Проверяем настройки
npm run env:list
```

## 🎨 Режимы вывода

### Чистый вывод (без npm wrapper)

```bash
# Используйте флаг -s для подавления npm вывода
npm run -s env:get PORT
# Выведет только: PORT=3000

npm run -s env:list
# Выведет только список переменных без заголовков npm
```

### Прямой вызов (максимально чистый)

```bash
# Windows
scripts\env.cmd get PORT

# Unix/Linux
./scripts/env.sh get PORT
```

## 🛡️ Безопасность

### Автоматическое сокрытие чувствительных данных

Команда `npm run env:list` автоматически скрывает значения переменных, содержащих:
- `PASSWORD`
- `SECRET`
- `KEY`
- `TOKEN`

### Управление резервными копиями

```bash
# Резервные копии содержат все данные, включая пароли
# Убедитесь, что они защищены:

# Просмотр существующих резервных копий
ls -la .env.backup.*

# Удаление старых резервных копий
rm .env.backup.2024-01-*
```

## 🔧 Отладка и диагностика

### Проверка состояния системы

```bash
# Валидация .env файла
npm run env:validate

# Статус миграций базы данных
npm run cli db migration:status

# Статус сидов
npm run cli db seed:status
```

### Решение проблем

```bash
# Если CLI не работает, проверьте сборку
npm run build

# Прямой вызов для отладки
node dist/cli/env.cli.js help
node dist/cli/db.cli.js help

# Проверка существования файлов
ls -la dist/cli/
```

## 📖 Дополнительная документация

- `src/docs/env-cli.md` - Подробная документация по ENV CLI
- `src/docs/error-handling.md` - Система обработки ошибок
- `src/docs/production-build.md` - Сборка для продакшена
- `src/docs/typescript-fixes.md` - Исправления TypeScript 
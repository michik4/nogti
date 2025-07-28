# CLI утилита управления переменными окружения

## Обзор

CLI утилита `env.cli.ts` предоставляет удобный интерфейс для управления переменными окружения в `.env` файле.

## Установка и запуск

Утилита запускается через npm скрипт:

```bash
npm run env <command> [options]
```

## Основные команды

### 📄 Создание и управление файлами

#### Создать новый .env файл
```bash
npm run env create
```
Создает новый `.env` файл с базовым шаблоном переменных.

#### Создать шаблон
```bash
npm run env template
```
Создает файл `.env.template` с пустыми значениями на основе существующего `.env`.

#### Копировать из другого файла
```bash
npm run env copy .env.example
npm run env copy /path/to/another/.env
```

### 🔧 Управление переменными

#### Получить значение переменной
```bash
npm run env get PORT
npm run env get DB_PASSWORD
```

#### Установить переменную
```bash
npm run env set PORT 3000
npm run env set NODE_ENV production
npm run env set DB_PASSWORD "mypassword123"
```

#### Удалить переменную
```bash
npm run env delete OLD_VARIABLE
npm run env del UNUSED_KEY
```

#### Показать все переменные
```bash
npm run env list
npm run env ls
```

### 💾 Резервное копирование

#### Создать резервную копию
```bash
npm run env backup
```
Создает файл `.env.backup.YYYY-MM-DDTHH-MM-SS`.

#### Восстановить из резервной копии
```bash
npm run env restore .env.backup.2024-01-15T10-30-00-000Z
```

### 🔍 Валидация и проверка

#### Проверить корректность .env файла
```bash
npm run env validate
```

Проверяет:
- Дублирующиеся ключи
- Пустые ключи
- Отсутствующие значения
- Синтаксические ошибки

### 💬 Интерактивный режим

```bash
npm run env edit
```

Запускает интерактивный режим редактирования с командами:
- `get` - получить значение
- `set` - установить значение  
- `delete` - удалить переменную
- `list` - показать все переменные
- `exit` - выйти

## Примеры использования

### Начальная настройка проекта
```bash
# Создать базовый .env файл
npm run env create

# Настроить основные переменные
npm run env set PORT 3000
npm run env set NODE_ENV development
npm run env set DB_PASSWORD "mypassword"

# Проверить результат
npm run env list
```

### Работа с базой данных
```bash
# Настройка подключения к БД
npm run env set DB_HOST localhost
npm run env set DB_PORT 5432
npm run env set DB_USERNAME postgres
npm run env set DB_DATABASE prometai_dev

# Проверка настроек
npm run env get DB_HOST
npm run env validate
```

### Переключение окружений
```bash
# Создать резервную копию текущих настроек
npm run env backup

# Переключиться на production
npm run env set NODE_ENV production
npm run env set DB_HOST prod-db-server
npm run env delete DEBUG_MODE

# При необходимости вернуться к предыдущим настройкам
npm run env restore .env.backup.2024-01-15T10-30-00-000Z
```

### Работа с командой
```bash
# Создать шаблон для команды
npm run env template

# Команда копирует шаблон и заполняет своими значениями
npm run env copy .env.template
npm run env set DB_PASSWORD "team_password"
npm run env set JWT_SECRET "team_secret"
```

## Безопасность

### Скрытие чувствительных данных
При выводе списка переменных (`npm run env list`) автоматически скрываются значения, содержащие:
- `PASSWORD`
- `SECRET` 
- `KEY`
- `TOKEN`

Эти значения отображаются как `***`.

### Резервные копии
Резервные копии содержат все данные включая пароли. Убедитесь, что:
- Файлы `.env.backup.*` добавлены в `.gitignore`
- Доступ к резервным копиям ограничен
- Старые резервные копии регулярно удаляются

## Структура создаваемого .env файла

По умолчанию создается файл со следующими секциями:

```env
# Настройки сервера
PORT=3000
NODE_ENV=development
HOST=localhost

# Настройки базы данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_DATABASE=prometai_dev

# Настройки логирования
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
ENABLE_RESPONSE_LOGGING=true

# JWT секрет
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS настройки
CORS_ORIGIN=http://localhost:3000
```

## Валидация

Команда `npm run env validate` проверяет:

✅ **Что проверяется:**
- Уникальность ключей
- Наличие значений для всех ключей
- Корректность синтаксиса KEY=VALUE
- Подсчет общего количества переменных

❌ **Типичные ошибки:**
- Дублирующиеся ключи
- Пустые ключи (строки вида `=value`)
- Отсутствующие значения (строки вида `KEY=`)

## Алиасы команд

- `del` = `delete`
- `ls` = `list`

## Справка

```bash
npm run env help
```

Показывает полную справку по всем доступным командам. 
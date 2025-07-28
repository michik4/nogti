# Система логирования

## Обзор

Сервер использует библиотеку `morgan` для логирования HTTP-запросов с дополнительными кастомными middleware для детального отслеживания.

## Установленные зависимости

```bash
npm install morgan
npm install -D @types/morgan
```

## Типы логирования

### 1. Стандартное логирование (Morgan)

- **Development**: Формат `dev` - краткий и цветной вывод
- **Production**: Формат `combined` - стандартный Apache формат
- **Custom**: Расширенный формат с временем ответа

### 2. Детальное логирование запросов

Кастомный middleware `requestBodyLogger` логирует:

- 📥 Входящие запросы (метод, URL, время)
- 🌐 IP-адрес клиента
- 📋 HTTP-заголовки (без чувствительных данных)
- 🔍 Query-параметры
- 📄 Тело запроса (с сокрытием паролей)
- 📤 Ответы сервера
- ⏱️ Время выполнения запроса

## Переменные окружения

```env
# Основные настройки
NODE_ENV=development          # development | production
PORT=3000

# Логирование
ENABLE_REQUEST_LOGGING=true   # включить детальное логирование запросов
ENABLE_RESPONSE_LOGGING=true  # включить логирование ответов
```

## Использование

### В основном файле сервера

```typescript
import { getLogger, requestBodyLogger } from "./middleware/logger.middleware";

app.use(getLogger()); // автоматический выбор логгера
app.use(requestBodyLogger); // детальное логирование
```

### Доступные middleware

```typescript
import { 
    successLogger,    // только успешные запросы
    errorLogger,      // только ошибки
    devLogger,        // режим разработки
    prodLogger,       // продакшен
    getLogger,        // автовыбор по NODE_ENV
    requestBodyLogger // детальное логирование
} from "./middleware/logger.middleware";
```

## Примеры вывода

### Development режим
```
GET /api/users 200 15.432 ms - 1024
📥 [2024-01-15T10:30:00.000Z] GET /api/users
🌐 IP: ::1
📋 Headers: { "user-agent": "Mozilla/5.0...", "accept": "application/json" }
📤 [2024-01-15T10:30:00.015Z] Response 200 - 15ms
```

### Production режим
```
::1 - - [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 1024 "-" "Mozilla/5.0..."
```

## Безопасность

Система автоматически скрывает чувствительные данные:
- `password` → `***`
- `token` → `***` 
- `access_token` → `***`
- `authorization` заголовок
- `cookie` заголовки

## Настройка уровня детализации

Для отключения детального логирования установите:
```env
ENABLE_REQUEST_LOGGING=false
ENABLE_RESPONSE_LOGGING=false
```

Это оставит только стандартное Morgan логирование. 
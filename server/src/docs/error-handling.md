# Система обработки ошибок

## Обзор

Сервер использует централизованную систему обработки ошибок с middleware для обработки 404 ошибок и других серверных ошибок.

## Структура ответов

Все ответы API, включая ошибки, следуют единому формату:

```typescript
{
    success: boolean,        // true для успешных запросов, false для ошибок
    error: string | null,    // описание ошибки или null для успешных запросов
    message: string,         // человекочитаемое сообщение
    status: string,          // "ok" | "error" | "warning" | "info" | "in_progress"
    code: number,           // HTTP статус код
    data: any              // данные ответа или дополнительная информация об ошибке
}
```

## Типы обработки ошибок

### 1. 404 - Not Found

Обрабатывается middleware `notFoundHandler`:

```typescript
// Автоматически обрабатывает все несуществующие маршруты
app.use(notFoundHandler);
```

**Пример ответа 404:**
```json
{
    "success": false,
    "error": "Маршрут GET /nonexistent не найден",
    "message": "Запрашиваемый ресурс не существует",
    "status": "error",
    "code": 404,
    "data": {
        "method": "GET",
        "url": "/nonexistent",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "ip": "::1"
    }
}
```

### 2. Серверные ошибки (500, 400, etc.)

Обрабатываются middleware `errorHandler`:

```typescript
// Централизованная обработка всех ошибок
app.use(errorLogger); // логирование
app.use(errorHandler); // обработка
```

**Пример ответа серверной ошибки:**
```json
{
    "success": false,
    "error": "Внутренняя ошибка сервера",
    "message": "Произошла внутренняя ошибка сервера",
    "status": "error",
    "code": 500,
    "data": {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "method": "POST",
        "url": "/api/users",
        "ip": "::1",
        "stack": "Error: Something went wrong..."  // только в development
    }
}
```

## Middleware компоненты

### notFoundHandler
- Обрабатывает все запросы к несуществующим маршрутам
- Логирует 404 ошибки в консоль
- Возвращает структурированный JSON ответ

### errorLogger
- Подробно логирует информацию об ошибках
- Включает IP, User-Agent, stack trace
- Форматирует вывод для удобного чтения

### errorHandler
- Централизованная обработка всех ошибок
- Определяет статус код и сообщение
- В development режиме включает stack trace
- Возвращает структурированный JSON ответ

### asyncErrorHandler
- Обертка для асинхронных route handlers
- Автоматически передает ошибки в error handler

## Использование в маршрутах

### Синхронные ошибки
```typescript
router.get("/error", (req, res, next) => {
    const error = new Error("Описание ошибки") as any;
    error.statusCode = 400;
    next(error);
});
```

### Асинхронные ошибки
```typescript
router.get("/async", async (req, res, next) => {
    try {
        await someAsyncOperation();
        res.json({ success: true, ... });
    } catch (error) {
        next(error);
    }
});
```

### Использование asyncErrorHandler
```typescript
import { asyncErrorHandler } from "../middleware/error.middleware";

router.get("/async", asyncErrorHandler(async (req, res) => {
    await someAsyncOperation();
    res.json({ success: true, ... });
}));
```

## Логирование ошибок

Система автоматически логирует:

### 404 ошибки
```
❌ 404 Error: GET /nonexistent - IP: ::1
```

### Серверные ошибки
```
🚨 [2024-01-15T10:30:00.000Z] ERROR OCCURRED
📍 POST /api/users
🌐 IP: ::1
🖥️  User-Agent: Mozilla/5.0...
💥 Error: Something went wrong
📚 Stack: Error: Something went wrong...
```

## Переменные окружения

```env
NODE_ENV=development  # включает stack trace в ответах ошибок
```

## Тестовые маршруты

Для тестирования обработки ошибок доступны:

- `GET /error` - имитация серверной ошибки 500
- `GET /async-error` - имитация асинхронной ошибки
- `GET /nonexistent` - тест 404 ошибки

## Безопасность

- В production режиме stack trace не включается в ответы
- Чувствительная информация автоматически исключается
- Все ошибки логируются для мониторинга 
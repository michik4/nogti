# API Документация

## Общая информация

Все ответы API имеют следующую структуру:
```typescript
interface ApiResponse<T> {
    success: boolean;      // Статус выполнения запроса
    error?: string;        // Сообщение об ошибке (если есть)
    data?: T;             // Данные ответа
    message?: string;     // Информационное сообщение
}
```

Для списков с пагинацией используется структура:
```typescript
interface PaginatedResponse<T> {
    success: boolean;
    error?: string;
    data: T[];
    message?: string;
    pagination: {
        page: number;      // Текущая страница
        limit: number;     // Количество элементов на странице
        total: number;     // Общее количество элементов
        totalPages: number; // Общее количество страниц
    }
}
```

## Базовый URL
Все запросы начинаются с `/api`

## CORS настройки
Сервер настроен для работы с клиентскими приложениями:
- Разрешенные origins: `http://localhost:5173`, `http://localhost:3000`
- Поддержка credentials (cookies)
- Разрешенные методы: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Разрешенные заголовки: Content-Type, Authorization

## Аутентификация

### Регистрация
```http
POST /api/auth/register
```

**Тело запроса:**
```typescript
{
    email: string;
    username: string;
    password: string;
    role: 'client' | 'nailmaster';
    fullName?: string;
    phone?: string;
}
```

**Ответ:**
```typescript
{
    success: boolean;
    data: {
        user: {
            id: string;
            email: string;
            username: string;
            role: string;
            fullName?: string;
        };
        token: string;
        refreshToken: string;
    }
}
```

### Регистрация администратора
```http
POST /api/auth/register-admin
```

**Тело запроса:**
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "admin123",
  "fullName": "Администратор",
  "phone": "+7 (999) 123-45-67",
  "adminSecret": "admin_secret_key_2024"
}
```

**Примечание:** Секретный ключ задается в переменной окружения `ADMIN_REGISTRATION_SECRET` или используется значение по умолчанию `admin_secret_key_2024`.

### Авторизация
```http
POST /api/auth/login
```

**Тело запроса:**
```typescript
{
    email?: string;
    phone?: string;
    password: string;
}
```

**Ответ:** аналогичен ответу регистрации

### Обновление токена
```http
POST /api/auth/refresh
```

**Заголовки:**
- `Authorization: Bearer <refreshToken>`

## Дизайны ногтей

### Получение списка дизайнов
```http
GET /api/designs
```

**Параметры запроса:**
- `page`: номер страницы (по умолчанию 1)
- `limit`: количество элементов на странице
- `search`: поисковый запрос
- `sort`: параметр сортировки

**Ответ:**
```typescript
PaginatedResponse<{
    id: string;
    title: string;
    description: string;
    images: string[];
    price: number;
    complexity: number;
    likesCount: number;
    isLiked?: boolean; // если пользователь авторизован
}>
```

### Получение дизайна по ID
```http
GET /api/designs/:id
```

### Лайк/анлайк дизайна
```http
POST /api/designs/:id/like
```
*Требуется авторизация с ролью client*

### Создание дизайна
```http
POST /api/designs
```
*Требуется авторизация с ролью client или nailmaster*

### Получение мастеров для дизайна
```http
GET /api/designs/:id/masters
```

### Получение всех дизайнов для администратора
```http
GET /api/designs/admin/all
```
**Требует:** роль `admin`

**Query параметры:**
- `page` - номер страницы
- `limit` - количество элементов на странице
- `isModerated` - фильтр по статусу модерации (true/false)
- `isActive` - фильтр по активности (true/false)
- `type` - тип дизайна (basic/designer)
- `source` - источник (admin/client/master)

### Модерация дизайна
```http
PUT /api/designs/:id/moderate
```
**Требует:** роль `admin`

**Body:**
```json
{
  "isModerated": true,
  "isActive": true
}
```

## Мастера

### Добавление дизайна в "Я так могу"
```http
POST /api/masters/can-do/:designId
```
*Требуется авторизация с ролью nailmaster*

### Удаление дизайна из "Я так могу"
```http
DELETE /api/masters/can-do/:designId
```
*Требуется авторизация с ролью nailmaster*

### Получение дизайнов мастера
```http
GET /api/masters/my-designs
```
*Требуется авторизация с ролью nailmaster*

### Обновление информации о дизайне
```http
PUT /api/masters/can-do/:designId
```
*Требуется авторизация с ролью nailmaster*

### Получение профиля мастера
```http
GET /api/masters/profile/:id
```

### Получение своего профиля
```http
GET /api/masters/profile
```
*Требуется авторизация с ролью nailmaster*

### Обновление профиля
```http
PUT /api/masters/profile
```
*Требуется авторизация с ролью nailmaster*

### Поиск ближайших мастеров
```http
GET /api/masters/nearby
```
**Параметры запроса:**
- `lat`: широта
- `lng`: долгота
- `radius`: радиус поиска в километрах

## Заказы

### Создание заказа
```http
POST /api/orders
```
*Требуется авторизация с ролью client*

### Получение заказов пользователя
```http
GET /api/orders/my
```
*Требуется авторизация*

### Подтверждение заказа мастером
```http
PUT /api/orders/:id/confirm
```
*Требуется авторизация с ролью nailmaster*

### Предложение альтернативного времени
```http
PUT /api/orders/:id/propose-time
```
*Требуется авторизация с ролью nailmaster*

### Отклонение заказа
```http
PUT /api/orders/:id/decline
```
*Требуется авторизация с ролью nailmaster*

### Принятие предложенного времени
```http
PUT /api/orders/:id/accept-time
```
*Требуется авторизация с ролью client*

### Завершение заказа
```http
PUT /api/orders/:id/complete
```
*Требуется авторизация с ролью client*

## Проверка работоспособности API

### Проверка здоровья API
```http
GET /api/health
```

**Ответ:**
```typescript
{
    success: true,
    message: string,
    timestamp: string
}
``` 
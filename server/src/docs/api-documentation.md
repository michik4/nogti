# API Документация - Платформа каталога маникюра

## Обзор API

Все API ответы имеют стандартную структуру:

```json
{
  "success": boolean,
  "error?": string,
  "data?": any,
  "message?": string
}
```

Для пагинированных ответов:

```json
{
  "success": boolean,
  "error?": string,
  "data": array,
  "message?": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Аутентификация

### JWT токены
API использует JWT токены для аутентификации. Токен передается в заголовке:
```
Authorization: Bearer <token>
```

### Роли пользователей
- `client` - Клиент
- `nailmaster` - Мастер маникюра
- `admin` - Администратор

## Endpoints

### Аутентификация (`/api/auth`)

#### POST /api/auth/register
Регистрация нового пользователя

**Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "role": "client|nailmaster",
  "fullName?": "Полное имя",
  "phone?": "+7XXXXXXXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "client",
      "fullName": "Полное имя"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Регистрация прошла успешно"
}
```

#### POST /api/auth/login
Авторизация пользователя

**Body:**
```json
{
  "email?": "user@example.com",  // email ИЛИ phone
  "phone?": "+7XXXXXXXXXX",
  "password": "password"
}
```

#### POST /api/auth/refresh
Обновление токена

**Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Дизайны (`/api/designs`)

#### GET /api/designs
Получить список дизайнов с фильтрами

**Query params:**
- `page` - Номер страницы (по умолчанию 1)
- `limit` - Количество элементов (по умолчанию 20)
- `type` - Тип дизайна (`basic|designer`)
- `source` - Источник (`admin|client|master`)
- `color` - Цвет (поиск по подстроке)
- `tags` - Теги через запятую

**Auth:** Опционально

#### GET /api/designs/:id
Получить дизайн по ID

**Auth:** Опционально

#### POST /api/designs/:id/like
Лайкнуть/убрать лайк с дизайна

**Auth:** Требуется (role: client)

#### POST /api/designs
Создать новый дизайн

**Body:**
```json
{
  "title": "Название дизайна",
  "description?": "Описание",
  "imageUrl": "https://example.com/image.jpg",
  "videoUrl?": "https://example.com/video.mp4",
  "type?": "basic|designer",
  "tags?": ["тег1", "тег2"],
  "color?": "красный",
  "estimatedPrice?": 1500.00
}
```

**Auth:** Требуется (role: client, nailmaster)

#### GET /api/designs/:id/masters
Получить мастеров для дизайна

**Query params:**
- `latitude` - Широта
- `longitude` - Долгота
- `radius` - Радиус поиска в км (по умолчанию 10)

**Auth:** Опционально

### Заказы (`/api/orders`)

#### POST /api/orders
Создать новый заказ

**Body:**
```json
{
  "nailDesignId": "uuid",
  "nailMasterId": "uuid",
  "requestedDateTime": "2024-01-01T10:00:00Z",
  "description?": "Описание заказа",
  "clientNotes?": "Заметки клиента"
}
```

**Auth:** Требуется (role: client)

#### GET /api/orders
Получить заказы пользователя

**Query params:**
- `page`, `limit` - Пагинация
- `status` - Фильтр по статусу

**Auth:** Требуется

#### PUT /api/orders/:id/confirm
Подтвердить заказ

**Body:**
```json
{
  "price?": 2000.00,
  "masterNotes?": "Заметки мастера"
}
```

**Auth:** Требуется (role: nailmaster)

#### PUT /api/orders/:id/propose-time
Предложить альтернативное время

**Body:**
```json
{
  "proposedDateTime": "2024-01-01T14:00:00Z",
  "masterNotes?": "Заметки мастера"
}
```

**Auth:** Требуется (role: nailmaster)

#### PUT /api/orders/:id/decline
Отклонить заказ

**Body:**
```json
{
  "masterNotes?": "Причина отклонения"
}
```

**Auth:** Требуется (role: nailmaster)

#### PUT /api/orders/:id/accept-proposed-time
Принять предложенное время

**Auth:** Требуется (role: client)

### Мастера (`/api/masters`)

#### POST /api/masters/can-do/:designId
Добавить дизайн в список "Я так могу"

**Body:**
```json
{
  "customPrice?": 2500.00,
  "notes?": "Заметки мастера",
  "estimatedDuration?": 120
}
```

**Auth:** Требуется (role: nailmaster)

#### DELETE /api/masters/can-do/:designId
Удалить дизайн из списка "Я так могу"

**Auth:** Требуется (role: nailmaster)

#### GET /api/masters/my-designs
Получить дизайны мастера

**Query params:** `page`, `limit`

**Auth:** Требуется (role: nailmaster)

#### PUT /api/masters/can-do/:designId
Обновить информацию о дизайне

**Body:**
```json
{
  "customPrice?": 2500.00,
  "notes?": "Заметки мастера",
  "estimatedDuration?": 120,
  "isActive?": true
}
```

**Auth:** Требуется (role: nailmaster)

#### GET /api/masters/profile/:id?
Получить профиль мастера

**Auth:** Опционально

#### PUT /api/masters/profile
Обновить профиль мастера

**Body:**
```json
{
  "fullName?": "Новое имя",
  "phone?": "+7XXXXXXXXXX",
  "address?": "Новый адрес",
  "description?": "Описание",
  "latitude?": 55.7558,
  "longitude?": 37.6176
}
```

**Auth:** Требуется (role: nailmaster)

#### GET /api/masters/nearby
Найти мастеров поблизости

**Query params:**
- `latitude`, `longitude` - Координаты (обязательны)
- `radius` - Радиус в км (по умолчанию 10)
- `page`, `limit` - Пагинация

**Auth:** Опционально

## Статусы заказов

- `pending` - Ожидает ответа мастера
- `confirmed` - Подтверждена мастером
- `alternative_proposed` - Мастер предложил другое время
- `declined` - Отклонена мастером
- `timeout` - Мастер не ответил в течение 5 минут
- `completed` - Выполнена
- `cancelled` - Отменена

## Коды ошибок

- `400` - Неверные данные запроса
- `401` - Не аутентифицирован
- `403` - Недостаточно прав
- `404` - Ресурс не найден
- `409` - Конфликт (например, дублирование)
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Полный процесс записи клиента

1. **Регистрация клиента:**
   ```
   POST /api/auth/register
   ```

2. **Просмотр каталога:**
   ```
   GET /api/designs?page=1&limit=20
   ```

3. **Лайк дизайна:**
   ```
   POST /api/designs/{id}/like
   ```

4. **Поиск мастеров для дизайна:**
   ```
   GET /api/designs/{id}/masters?latitude=55.7558&longitude=37.6176
   ```

5. **Создание заказа:**
   ```
   POST /api/orders
   ```

6. **Отслеживание статуса:**
   ```
   GET /api/orders
   ```

### Мастер добавляет "Я так могу"

1. **Просмотр каталога:**
   ```
   GET /api/designs
   ```

2. **Добавление дизайна в список:**
   ```
   POST /api/masters/can-do/{designId}
   ```

3. **Просмотр своих дизайнов:**
   ```
   GET /api/masters/my-designs
   ```

4. **Обработка заказов:**
   ```
   GET /api/orders
   PUT /api/orders/{id}/confirm
   ``` 
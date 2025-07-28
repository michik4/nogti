# Документация по сервисам клиентской части

## Обзор

Все сервисы предоставляют единый интерфейс для взаимодействия с API сервера. Каждый сервис является синглтоном и экспортируется как готовый экземпляр.

## Структура сервисов

- `apiService` - базовый HTTP клиент с обработкой авторизации
- `authService` - авторизация и управление пользователями
- `designsService` - работа с дизайнами ногтей
- `mastersService` - работа с мастерами
- `ordersService` - управление заказами

## Использование

### Импорт сервисов

```typescript
import { authService, designsService, mastersService, ordersService } from '@/services';
```

### Авторизация

```typescript
// Вход в систему
try {
  const authData = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Пользователь авторизован:', authData.user);
} catch (error) {
  console.error('Ошибка авторизации:', error.message);
}

// Регистрация
try {
  const authData = await authService.register({
    email: 'user@example.com',
    username: 'username',
    password: 'password123',
    role: 'client',
    fullName: 'Имя Фамилия'
  });
} catch (error) {
  console.error('Ошибка регистрации:', error.message);
}

// Проверка авторизации
if (authService.isAuthenticated()) {
  const user = authService.getCurrentUser();
  console.log('Текущий пользователь:', user);
}

// Выход
authService.logout();
```

### Работа с дизайнами

```typescript
// Получение списка дизайнов
try {
  const designs = await designsService.getDesigns({
    page: 1,
    limit: 20,
    search: 'французский маникюр',
    category: 'basic'
  });
  console.log('Дизайны:', designs.data);
} catch (error) {
  console.error('Ошибка получения дизайнов:', error.message);
}

// Получение дизайна по ID
try {
  const design = await designsService.getDesignById('design-id');
  console.log('Дизайн:', design);
} catch (error) {
  console.error('Дизайн не найден:', error.message);
}

// Лайк дизайна
try {
  const result = await designsService.toggleLike('design-id');
  console.log('Лайк:', result.isLiked, 'Всего лайков:', result.likesCount);
} catch (error) {
  console.error('Ошибка лайка:', error.message);
}

// Создание дизайна
try {
  const newDesign = await designsService.createDesign({
    title: 'Новый дизайн',
    description: 'Описание дизайна',
    images: ['url1', 'url2'],
    price: 1500,
    complexity: 3,
    category: 'designer',
    tags: ['стразы', 'блестки']
  });
} catch (error) {
  console.error('Ошибка создания дизайна:', error.message);
}
```

### Работа с мастерами

```typescript
// Поиск ближайших мастеров
try {
  const masters = await mastersService.findNearbyMasters({
    designId: 'design-id',
    lat: 55.7558,
    lng: 37.6176,
    radius: 10
  });
  console.log('Ближайшие мастера:', masters);
} catch (error) {
  console.error('Ошибка поиска мастеров:', error.message);
}

// Получение профиля мастера
try {
  const masterProfile = await mastersService.getMasterProfile('master-id');
  console.log('Профиль мастера:', masterProfile);
} catch (error) {
  console.error('Профиль не найден:', error.message);
}

// Добавление дизайна в "Я так могу" (для мастеров)
try {
  await mastersService.addCanDoDesign('design-id');
  console.log('Дизайн добавлен в список');
} catch (error) {
  console.error('Ошибка добавления дизайна:', error.message);
}

// Получение дизайнов мастера
try {
  const masterDesigns = await mastersService.getMasterDesigns();
  console.log('Дизайны мастера:', masterDesigns);
} catch (error) {
  console.error('Ошибка получения дизайнов:', error.message);
}
```

### Работа с заказами

```typescript
// Создание заказа
try {
  const order = await ordersService.createOrder({
    masterId: 'master-id',
    designId: 'design-id',
    appointmentTime: '2024-01-15T14:00:00Z',
    price: 2000
  });
  console.log('Заказ создан:', order);
} catch (error) {
  console.error('Ошибка создания заказа:', error.message);
}

// Получение заказов пользователя
try {
  const orders = await ordersService.getUserOrders({
    page: 1,
    limit: 10,
    status: 'pending'
  });
  console.log('Заказы:', orders.data);
} catch (error) {
  console.error('Ошибка получения заказов:', error.message);
}

// Подтверждение заказа (для мастеров)
try {
  const confirmedOrder = await ordersService.confirmOrder('order-id');
  console.log('Заказ подтвержден:', confirmedOrder);
} catch (error) {
  console.error('Ошибка подтверждения:', error.message);
}

// Предложение альтернативного времени (для мастеров)
try {
  const updatedOrder = await ordersService.proposeAlternativeTime(
    'order-id',
    '2024-01-16T15:00:00Z'
  );
  console.log('Предложено новое время:', updatedOrder);
} catch (error) {
  console.error('Ошибка предложения времени:', error.message);
}
```

## Обработка ошибок

Все сервисы выбрасывают исключения с понятными сообщениями об ошибках. Рекомендуется использовать try-catch блоки:

```typescript
try {
  const result = await someService.someMethod();
  // Обработка успешного результата
} catch (error) {
  // Обработка ошибки
  console.error('Ошибка:', error.message);
  
  // Можно показать уведомление пользователю
  showNotification('error', error.message);
}
```

## Авторизация

Все сервисы автоматически добавляют токен авторизации к запросам. При истечении токена происходит автоматическое обновление. Если обновление не удается, пользователь перенаправляется на страницу входа.

## Типы данных

Все типы данных импортируются из `@/services`:

```typescript
import { 
  type User, 
  type NailDesign, 
  type Master, 
  type Order,
  type LoginRequest,
  type RegisterRequest 
} from '@/services';
```

## Конфигурация

Базовый URL API настраивается через переменную окружения `VITE_API_URL` в файле `.env`. 
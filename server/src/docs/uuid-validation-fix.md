# Исправление ошибки валидации UUID в добавлении дизайнов к услугам

## Проблема

При добавлении дизайна к услуге мастера возникала ошибка:
```
QueryFailedError: неверный синтаксис для типа uuid: "default"
```

Ошибка происходила потому, что в клиентском коде создавался фиктивный объект услуги с `id: 'default'`, который не является валидным UUID.

## Причина

В файле `client/src/pages/dashboard/MasterDashboard.tsx` в функции `handleAddDesignClick` создавался объект:

```typescript
const defaultService: MasterService = safeServices[0] || {
  id: 'default', // ← Это не валидный UUID
  name: 'Базовая услуга',
  price: 0,
  duration: 60,
  isActive: true,
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

## Исправления

### 1. Клиентская часть

Заменили логику создания фиктивного сервиса на проверку существования услуг:

```typescript
const handleAddDesignClick = () => {
  // Проверяем, есть ли у мастера услуги
  if (safeServices.length === 0) {
    toast.error('Сначала создайте услугу, чтобы добавить к ней дизайн');
    return;
  }
  
  // Используем первую доступную услугу
  const firstService = safeServices[0];
  setSelectedService(firstService);
  setIsAddDesignOpen(true);
};
```

### 2. Серверная часть

Добавили валидацию UUID формата для всех функций, работающих с `serviceId` и `designId`:

```typescript
private static validateUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
```

Валидация добавлена в функции:
- `addDesignToService`
- `removeDesignFromService` 
- `updateServiceDesign`

Пример использования:
```typescript
if (!MasterController.validateUUID(serviceId)) {
    console.log('Невалидный UUID для serviceId:', serviceId);
    ResponseUtil.error(res, 'Невалидный идентификатор услуги', 400);
    return;
}
```

## Результат

- Устранена ошибка PostgreSQL при обработке невалидных UUID
- Добавлена валидация на стороне сервера для предотвращения подобных ошибок
- Улучшен UX - пользователь получает понятное сообщение о необходимости сначала создать услугу
- Код стал более безопасным и устойчивым к ошибкам

## Тестирование

1. При попытке добавить дизайн без созданных услуг - показывается уведомление
2. При отправке невалидного UUID на сервер - возвращается ошибка 400 с понятным сообщением
3. Нормальный флоу добавления дизайна к существующей услуге работает корректно 
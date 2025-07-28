# Исправление видимости собственных дизайнов мастера

## Проблема

Мастера не могли видеть свои собственные дизайны в модальном окне выбора дизайнов (`BrowseDesignsModal`), если эти дизайны еще не прошли модерацию администратором. Это происходило потому, что API возвращал только модерированные дизайны (`isModerated = true`).

## Симптомы

- Дизайн успешно создавался и привязывался к услуге мастера
- В `GET /masters/services/:serviceId/designs` дизайн отображался корректно
- В `GET /designs` (общий список) дизайн не отображался
- `BrowseDesignsModal` показывал пустой список при поиске

## Решение

Добавлен параметр `includeOwn` в API эндпоинты для получения дизайнов, который позволяет мастерам видеть свои собственные дизайны независимо от статуса модерации.

### Серверная часть

#### Обновлен метод `getDesigns`

```typescript
// Новые параметры
const includeOwn = req.query.includeOwn === 'true';
const userId = req.userId;

// Логика фильтрации
if (includeOwn && userId) {
    queryBuilder.andWhere(
        '(design.isModerated = :isModerated OR design.uploadedByClient = :userId OR design.uploadedByMaster = :userId)',
        { isModerated: true, userId }
    );
} else {
    queryBuilder.andWhere('design.isModerated = :isModerated', { isModerated: true });
}
```

#### Обновлен метод `searchDesigns`

- Изменен тип параметра с `Request` на `AuthenticatedRequest`
- Добавлена аналогичная логика для параметра `includeOwn`
- Обновлен роут для использования `AuthMiddleware.optionalAuth`

#### Добавлены JOINы

```typescript
.leftJoinAndSelect('design.uploadedByClient', 'uploadedByClient')
.leftJoinAndSelect('design.uploadedByMaster', 'uploadedByMaster')
```

Это позволяет сравнивать ID пользователя с авторами дизайнов.

### Клиентская часть

#### Обновлен интерфейс `GetDesignsParams`

```typescript
export interface GetDesignsParams {
  // ... существующие поля
  includeOwn?: boolean;
}
```

#### Обновлены методы `designService`

- `getAllDesigns()` - добавлена поддержка параметра `includeOwn`
- `searchDesigns()` - добавлена поддержка параметра `includeOwn`

#### Обновлен `BrowseDesignsModal`

```typescript
const [filters, setFilters] = useState<GetDesignsParams>({
  // ... другие параметры
  includeOwn: true // Показываем свои дизайны мастеру
});
```

## Логика работы

1. **Для неавторизованных пользователей**: показываются только модерированные дизайны
2. **Для авторизованных пользователей с `includeOwn = false`**: показываются только модерированные дизайны  
3. **Для авторизованных пользователей с `includeOwn = true`**: показываются:
   - Все модерированные дизайны
   - Собственные дизайны (независимо от статуса модерации)

## Маршруты

### Обновленные эндпоинты

- `GET /api/designs?includeOwn=true` - получить дизайны включая собственные
- `GET /api/designs/search?query=...&includeOwn=true` - поиск включая собственные

### Роуты с опциональной авторизацией

```typescript
router.get('/search', AuthMiddleware.optionalAuth, NailDesignController.searchDesigns);
router.get('/', AuthMiddleware.optionalAuth, NailDesignController.getDesigns);
```

## Безопасность

- Пользователи видят только свои собственные дизайны
- Проверка происходит по `uploadedByClient` и `uploadedByMaster`
- Модерированные дизайны остаются видимыми всем

## Результат

- ✅ Мастера видят свои дизайны в `BrowseDesignsModal`
- ✅ Немодерированные дизайны доступны только автору
- ✅ Обратная совместимость сохранена
- ✅ Безопасность не нарушена

Теперь мастера могут использовать свои созданные дизайны сразу после создания, не дожидаясь модерации администратора. 
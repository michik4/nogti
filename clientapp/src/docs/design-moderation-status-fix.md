# Исправление отображения статуса модерации дизайнов

## Проблема

После исправления видимости собственных дизайнов мастера, дизайны начали отображаться во вкладке "Мои дизайны", но их статус модерации отображался неправильно - они показывались как активные, хотя находились на модерации.

## Причина

1. **Неполная типизация**: В интерфейсе `MasterDesign` у вложенного объекта `nailDesign` отсутствовали поля `isActive`, `isModerated`, `likesCount`, `ordersCount`

2. **Отсутствие визуальных индикаторов**: Во вкладке "Мои дизайны" не отображался статус модерации дизайна

## Исправления

### 1. Обновлен интерфейс `MasterDesign`

**Файл**: `client/src/types/master.types.ts`

**Было**:
```typescript
export interface MasterDesign {
  id: string;
  nailDesign: {
    id: string;
    title: string;
    imageUrl: string;
    description?: string;
    estimatedPrice?: number;
    type: 'basic' | 'designer';
    tags?: string[];
  };
  // ...
}
```

**Стало**:
```typescript
export interface MasterDesign {
  id: string;
  nailDesign: {
    id: string;
    title: string;
    imageUrl: string;
    description?: string;
    estimatedPrice?: number;
    type: 'basic' | 'designer';
    tags?: string[];
    isActive: boolean;
    isModerated: boolean;
    likesCount: number;
    ordersCount: number;
  };
  // ...
}
```

### 2. Добавлены визуальные индикаторы

**Файл**: `client/src/pages/dashboard/MasterDashboard.tsx`

#### Прозрачность изображения
```typescript
className={`w-full h-48 object-cover ${!design.nailDesign?.isModerated ? 'opacity-70' : ''}`}
```

#### Оверлей статуса на изображении
```tsx
{!design.nailDesign?.isModerated && (
  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
    На модерации
  </div>
)}
{design.nailDesign?.isModerated && !design.nailDesign?.isActive && (
  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
    Отклонен
  </div>
)}
```

#### Badge статуса модерации
```tsx
<Badge variant={design.nailDesign?.isModerated ? "outline" : "destructive"} className="text-xs">
  {design.nailDesign?.isModerated ? "Проверен" : "На модерации"}
</Badge>
```

## Визуальные состояния

### 1. Дизайн на модерации (`isModerated: false`)
- **Изображение**: прозрачность 70%
- **Оверлей**: желтый badge "На модерации"
- **Статус**: красный badge "На модерации"

### 2. Дизайн одобрен (`isModerated: true, isActive: true`)
- **Изображение**: полная прозрачность
- **Оверлей**: отсутствует
- **Статус**: серый badge "Проверен"

### 3. Дизайн отклонен (`isModerated: true, isActive: false`)
- **Изображение**: полная прозрачность
- **Оверлей**: красный badge "Отклонен"
- **Статус**: серый badge "Проверен"

## Логика отображения

```typescript
// Прозрачность изображения
!design.nailDesign?.isModerated ? 'opacity-70' : ''

// Статус модерации
design.nailDesign?.isModerated ? "Проверен" : "На модерации"

// Цвет badge статуса
design.nailDesign?.isModerated ? "outline" : "destructive"

// Оверлей статуса
!design.nailDesign?.isModerated → "На модерации" (желтый)
design.nailDesign?.isModerated && !design.nailDesign?.isActive → "Отклонен" (красный)
```

## Компоненты с аналогичной логикой

Такая же логика отображения статуса модерации используется в:

1. **MasterDashboard** - вкладка "Услуги" (дизайны услуг)
2. **MasterDashboard** - вкладка "Мои дизайны" (исправлено)
3. **DesignInfo** - страница дизайна
4. **AdminDashboard** - управление дизайнами

## Результат

- ✅ **Корректное отображение** статуса модерации во всех компонентах
- ✅ **Визуальная разница** между модерированными и немодерированными дизайнами
- ✅ **Полная типизация** всех необходимых полей
- ✅ **Единообразие UI** во всех частях приложения

Теперь мастера могут четко видеть статус модерации своих дизайнов и понимать, какие из них уже доступны клиентам, а какие еще ожидают проверки. 
# Обновления расчета стоимости в модалке записи

## Обзор

Обновлен расчет общей стоимости записи для корректного учета цены выбранной услуги + цены выбранного дизайна. Исправлена ошибка с получением цены дизайна.

## Внесенные изменения

### 1. Исправлен расчет общей стоимости
**Файл:** `clientapp2/src/components/BookingModal.tsx`

**Проблема:** Цена дизайна не учитывалась в общей стоимости
**Решение:** Исправлено получение цены дизайна из `selectedDesign.customPrice` вместо `selectedDesign.nailDesign.price`

**Изменения:**
```typescript
// Было:
if (selectedDesign?.nailDesign?.price) {
  total += selectedDesign.nailDesign.price;
}

// Стало:
if (selectedDesign?.customPrice) {
  total += selectedDesign.customPrice;
}
```

### 2. Добавлен блок отображения общей стоимости
**Файл:** `clientapp2/src/components/BookingModal.tsx`

**Новый блок:** Отдельный блок с детальным расчетом стоимости
- Показывает цену услуги
- Показывает дополнительную стоимость дизайна (если выбран)
- Отображает общую сумму

### 3. Обновлено отображение цены в информации об услуге
**Файл:** `clientapp2/src/components/BookingModal.tsx`

**Добавлено:** Показ дополнительной стоимости дизайна в блоке информации об услуге
```typescript
{selectedDesign?.customPrice && (
  <span className="text-xs text-muted-foreground">
    +{selectedDesign.customPrice}₽ за дизайн
  </span>
)}
```

### 4. Обновлено описание записи
**Файл:** `clientapp2/src/components/BookingModal.tsx`

**Изменено:** Описание записи теперь включает детальную информацию о стоимости
```typescript
description: `Запись на ${service.name}${selectedDesign ? ` - ${selectedDesign.nailDesign.title}` : ''} (${service.price}₽${selectedDesign?.customPrice ? ` + ${selectedDesign.customPrice}₽` : ''})`
```

## Структура данных

### MasterServiceDesign:
```typescript
interface MasterServiceDesign {
  id: string;
  customPrice?: number; // Цена дизайна для этой услуги
  additionalDuration?: number;
  notes?: string;
  nailDesign: {
    id: string;
    title: string;
    // ... другие поля
  };
}
```

### Расчет стоимости:
```typescript
const calculateTotalPrice = () => {
  let total = service?.price || 0; // Базовая цена услуги
  if (selectedDesign?.customPrice) {
    total += selectedDesign.customPrice; // Дополнительная цена дизайна
  }
  return total;
};
```

## Визуальные улучшения

### Новый блок общей стоимости:
- **Заголовок:** "Общая стоимость"
- **Детализация:** Показывает цену услуги и дизайна отдельно
- **Итого:** Крупным шрифтом показывает общую сумму
- **Стилизация:** Выделен цветом primary с рамкой

### Отображение в информации об услуге:
- **Базовая цена:** Показывается основная цена услуги
- **Дополнительная стоимость:** Показывается "+X₽ за дизайн" если выбран дизайн

## Пользовательский опыт

### Процесс выбора:
1. **Выбор услуги** - видна базовая цена
2. **Выбор дизайна** - появляется дополнительная стоимость
3. **Общая стоимость** - автоматически пересчитывается
4. **Детализация** - видно из чего складывается цена

### Валидация:
- Проверка наличия цены дизайна перед отображением
- Корректное отображение только при наличии `customPrice`
- Правильное форматирование с символом "+" для дополнительной стоимости

## Технические детали

### Функция расчета:
```typescript
const calculateTotalPrice = () => {
  let total = service?.price || 0;
  if (selectedDesign?.customPrice) {
    total += selectedDesign.customPrice;
  }
  return total;
};
```

### Условное отображение:
```typescript
{selectedDesign && selectedDesign.customPrice && (
  <div className="flex justify-between text-sm">
    <span>Дизайн "{selectedDesign.nailDesign.title}":</span>
    <span>+{selectedDesign.customPrice}₽</span>
  </div>
)}
```

## Дата обновления

Обновления внесены: **2024 год** 
# Выбор создания дизайна: привязка к услуге или общая библиотека

## Обзор

Реализована возможность выбора при создании дизайна: привязать его к конкретной услуге мастера или создать в общую библиотеку для использования всеми мастерами.

## Функциональность

### 🎯 **Варианты создания дизайна**

1. **В общую библиотеку** (по умолчанию):
   - Дизайн создается без привязки к услуге
   - Доступен всем мастерам после модерации
   - Сохраняется в общем каталоге дизайнов

2. **Привязка к услуге**:
   - Дизайн создается и сразу привязывается к выбранной услуге
   - Автоматически добавляется в список дизайнов услуги
   - Наследует цену услуги по умолчанию

### 🖼️ **Интерфейс выбора**

В модальном окне "Создать новый дизайн" добавлен раздел выбора:

```tsx
<div className="space-y-3">
  {/* Радиокнопка: В общую библиотеку */}
  <div className="flex items-center space-x-2">
    <input type="radio" value="library" checked={selectedService === 'library'} />
    <Label>В общую библиотеку (будет доступен всем мастерам после модерации)</Label>
  </div>
  
  {/* Радиокнопка: Привязать к услуге */}
  <div className="flex items-center space-x-2">
    <input type="radio" value="service" checked={selectedService !== 'library'} />
    <Label>Привязать к услуге</Label>
  </div>
  
  {/* Выпадающий список услуг */}
  {selectedService !== 'library' && (
    <Select value={selectedService} onValueChange={setSelectedService}>
      {services.map(service => (
        <SelectItem value={service.id}>
          {service.name} ({service.price}₽)
        </SelectItem>
      ))}
    </Select>
  )}
</div>
```

## Изменения в компонентах

### 1. AddDesignModal

#### Обновленный интерфейс
```typescript
interface AddDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (designData: CreateDesignData, serviceId?: string) => void;
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}
```

#### Новое состояние
```typescript
const [selectedService, setSelectedService] = useState<string>('library');
```

#### Логика ценообразования
- **Библиотека**: цена по умолчанию = 0, пользователь указывает вручную
- **Услуга**: цена по умолчанию = цена услуги, можно изменить

### 2. MasterDashboard

#### Упрощенное открытие модального окна
```typescript
const handleAddDesignClick = () => {
  // Больше не требуется проверка наличия услуг
  setIsAddDesignOpen(true);
};
```

#### Обновленная обработка создания
```typescript
const handleCreateDesign = async (designData: any, serviceId?: string) => {
  const response = await designService.createNailDesign(designData);
  
  if (!serviceId) {
    // Дизайн создан в библиотеку
    toast.success('Дизайн создан и отправлен на модерацию в общую библиотеку');
    return;
  }
  
  // Дизайн привязывается к услуге
  await masterService.addDesignToService(serviceId, response.data.id, {...});
  toast.success(`Дизайн создан и добавлен к услуге "${serviceName}"`);
};
```

## Пользовательский опыт

### До изменений
1. Нажатие "Добавить дизайн" → проверка наличия услуг
2. Если услуг нет → ошибка "Сначала создайте услугу"
3. Дизайн создавался только для первой услуги

### После изменений
1. Нажатие "Добавить дизайн" → открытие модального окна
2. Выбор: библиотека (по умолчанию) или конкретная услуга
3. Возможность создания дизайна без услуг

### Преимущества
- ✅ **Гибкость**: можно создавать дизайны для библиотеки или услуг
- ✅ **Доступность**: не требуется создавать услуги для добавления дизайнов
- ✅ **Переиспользование**: дизайны в библиотеке доступны всем мастерам
- ✅ **Интуитивность**: понятный выбор назначения дизайна

## Логика обработки

### Создание в библиотеку (`serviceId = undefined`)
```typescript
if (!serviceId) {
  // Создаем только дизайн
  await designService.createNailDesign(designData);
  toast.success('Дизайн создан в общую библиотеку');
  return;
}
```

### Привязка к услуге (`serviceId = string`)
```typescript
// 1. Создаем дизайн
const design = await designService.createNailDesign(designData);

// 2. Привязываем к услуге
await masterService.addDesignToService(serviceId, design.id, {
  customPrice: designData.estimatedPrice,
  notes: `Дизайн создан для услуги "${serviceName}"`
});

// 3. Обновляем UI
setServiceDesigns(prev => ({
  ...prev,
  [serviceId]: [...prev[serviceId], newDesign]
}));
```

## Состояния UI

### Выбор библиотеки
- **Цена**: поле ввода с placeholder "0"
- **Подсказка**: "Укажите примерную стоимость дизайна"
- **Результат**: дизайн в общей библиотеке

### Выбор услуги
- **Цена**: поле ввода с placeholder цены услуги
- **Подсказка**: "По умолчанию: {price}₽ (цена услуги "{name}")"
- **Результат**: дизайн привязан к услуге

## Совместимость

- ✅ **Обратная совместимость**: существующая логика не нарушена
- ✅ **API**: используются те же эндпоинты
- ✅ **Типизация**: обновлены интерфейсы без breaking changes
- ✅ **UX**: улучшен пользовательский опыт

Теперь мастера могут свободно создавать дизайны как для своих услуг, так и для общего использования, что повышает гибкость системы и способствует развитию общей библиотеки дизайнов. 
# Обновление модального окна выбора дизайнов

## Проблема
В модальном окне выбора дизайна для услуги не отображались дизайны из вкладки "Мои дизайны". Показывались только дизайны, добавленные в список "Я так могу", но не отображались дизайны, созданные мастером.

## Решение

### 1. Обновлен BrowseDesignsModal.tsx
- Заменен вызов `masterService.getMasterDesigns()` на `masterService.getAllMasterDesigns()`
- Добавлено преобразование данных в формат MasterDesign для совместимости
- Обновлено отображение бейджей для различения созданных и добавленных дизайнов

### 2. Изменения в fetchDesigns
```typescript
const fetchDesigns = async () => {
  try {
    setLoading(true);
    
    if (!masterId) {
      console.error('ID мастера не найден');
      toast.error('Ошибка: ID мастера не найден');
      setDesigns([]);
      return;
    }
    
    // Используем getAllMasterDesigns для получения всех дизайнов мастера
    const response = await masterService.getAllMasterDesigns(masterId);

    if (response && Array.isArray(response)) {
      // Преобразуем ответ в формат MasterDesign для совместимости
      const masterDesigns = response.map((design: any) => ({
        id: design.id,
        nailDesign: design,
        isActive: design.isActive !== false,
        customPrice: design.minPrice || 0,
        estimatedDuration: 60,
        addedAt: design.createdAt || new Date().toISOString()
      }));
      setDesigns(masterDesigns);
    } else {
      setDesigns([]);
    }
  } catch (error) {
    console.error('Ошибка загрузки дизайнов:', error);
    toast.error('Не удалось загрузить ваши дизайны');
    setDesigns([]);
  } finally {
    setLoading(false);
  }
};
```

### 3. Обновлено отображение бейджей
```typescript
{design.uploadedByMaster?.id ? (
  <Badge variant="default" className="text-xs">
    Создан мной
  </Badge>
) : (
  <Badge variant="outline" className="text-xs">
    Добавлен
  </Badge>
)}
```

### 4. Обновлен текст для пустого состояния
- Изменен текст с "У вас пока нет добавленных дизайнов" на "У вас пока нет дизайнов"
- Обновлено описание: "Создайте дизайны или добавьте существующие в список 'Я так могу'"

### 5. Исправлена ошибка 500 при загрузке дизайнов
**Проблема:** При вызове `getAllMasterDesigns()` без параметра `masterId` использовался endpoint `/designs/master/me`, что приводило к ошибке 500.

**Решение:**
- Добавлен параметр `masterId` в интерфейс `BrowseDesignsModalProps`
- Передача `currentUser?.id` в компонент `BrowseDesignsModal`
- Добавлена проверка наличия `masterId` перед вызовом API
- Использование правильного endpoint `/designs/master/:masterId`

## Технические детали

### API Endpoint
- Используется `getAllMasterDesigns()` вместо `getMasterDesigns()`
- Возвращает как созданные мастером дизайны, так и добавленные в услуги

### Преобразование данных
```typescript
const masterDesigns = response.map((design: any) => ({
  id: design.id,
  nailDesign: design,
  isActive: design.isActive !== false,
  customPrice: design.minPrice || 0,
  estimatedDuration: 60,
  addedAt: design.createdAt || new Date().toISOString()
}));
```

### Отображение
- Показывается тип дизайна (Дизайнерский/Базовый)
- Для созданных мастером дизайнов добавляется бейдж "Создан мной"
- Для добавленных дизайнов добавляется бейдж "Добавлен"

## Результат
Теперь в модальном окне выбора дизайна для услуги отображаются:
1. **Дизайны, созданные мастером** - с бейджем "Создан мной"
2. **Дизайны, добавленные в услуги** - с бейджем "Добавлен"

Мастер может выбрать любой из своих дизайнов для добавления к услуге. 
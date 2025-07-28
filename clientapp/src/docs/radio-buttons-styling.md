# Стилизация радиокнопок в модальном окне создания дизайна

## Обзор

Заменены обычные HTML радиокнопки на стилизованный компонент `RadioGroup` из библиотеки Radix UI для улучшения внешнего вида и пользовательского опыта.

## Изменения

### До: HTML input радиокнопки
```tsx
<div className="flex items-center space-x-2">
  <input
    type="radio"
    id="library"
    name="service"
    value="library"
    checked={selectedService === 'library'}
    onChange={(e) => setSelectedService(e.target.value)}
    className="w-4 h-4"
  />
  <Label htmlFor="library" className="font-normal">
    В общую библиотеку (будет доступен всем мастерам после модерации)
  </Label>
</div>
```

### После: Стилизованный RadioGroup
```tsx
<div className="border border-border rounded-lg p-4 bg-muted/30">
  <RadioGroup 
    value={selectedService === 'library' ? 'library' : 'service'} 
    onValueChange={(value) => {
      if (value === 'library') {
        setSelectedService('library');
      } else {
        setSelectedService(services[0]?.id || 'library');
      }
    }}
    className="space-y-4"
  >
    <div className="flex items-start space-x-3">
      <RadioGroupItem value="library" id="library" className="mt-1" />
      <div className="space-y-1">
        <Label htmlFor="library" className="font-medium cursor-pointer">
          В общую библиотеку
        </Label>
        <p className="text-sm text-muted-foreground">
          Дизайн будет доступен всем мастерам после модерации
        </p>
      </div>
    </div>
  </RadioGroup>
</div>
```

## Ключевые улучшения

### 🎨 **Визуальное оформление**
- **Стилизованные радиокнопки**: использование Radix UI RadioGroup с профессиональным дизайном
- **Фон и границы**: добавлен светлый фон (`bg-muted/30`) и скругленные границы для визуального группирования
- **Отступы**: добавлены внутренние отступы (`p-4`) для лучшего восприятия

### 📝 **Улучшенная типографика**
- **Заголовки**: увеличен размер и вес шрифта для основных заголовков (`text-base font-medium`)
- **Описания**: разделены заголовки и описания для лучшей читаемости
- **Цветовая схема**: использование `text-muted-foreground` для второстепенного текста

### 🖱️ **Интерактивность**
- **Курсор**: добавлен `cursor-pointer` для всех кликабельных элементов
- **Выравнивание**: использование `items-start` вместо `items-center` для корректного выравнивания многострочного контента
- **Отступ**: добавлен `mt-1` для радиокнопок для выравнивания с первой строкой текста

## Структура компонента

### RadioGroup
```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<RadioGroup 
  value={currentValue} 
  onValueChange={handleChange}
  className="space-y-4"
>
  <div className="flex items-start space-x-3">
    <RadioGroupItem value="option1" id="option1" className="mt-1" />
    <div className="space-y-1">
      <Label htmlFor="option1" className="font-medium cursor-pointer">
        Заголовок опции
      </Label>
      <p className="text-sm text-muted-foreground">
        Описание опции
      </p>
    </div>
  </div>
</RadioGroup>
```

### Стили RadioGroupItem
- **Размер**: `h-4 w-4` - стандартный размер радиокнопки
- **Форма**: `rounded-full` - круглая форма
- **Цвета**: `border-primary text-primary` - основные цвета темы
- **Фокус**: `focus-visible:ring-2` - кольцо фокуса для доступности
- **Состояния**: поддержка disabled состояния

## CSS-классы

### Контейнер
- `border border-border` - граница с цветом темы
- `rounded-lg` - скругленные углы
- `p-4` - внутренние отступы
- `bg-muted/30` - полупрозрачный фон

### Группировка
- `space-y-4` - вертикальные отступы между элементами
- `space-y-3` - меньшие отступы для вложенных элементов
- `space-x-3` - горизонтальные отступы

### Выравнивание
- `flex items-start` - выравнивание по верхнему краю
- `mt-1` - небольшой отступ сверху для радиокнопки

## Преимущества

### 🎯 **Пользовательский опыт**
- **Лучшая доступность**: корректная работа с клавиатурой и скрин-ридерами
- **Визуальная ясность**: четкое разделение опций и их описаний
- **Профессиональный вид**: современный дизайн в стиле приложения

### 🔧 **Техническая составляющая**
- **Консистентность**: единый стиль с остальными компонентами
- **Гибкость**: легко изменяемые стили через Tailwind классы
- **Производительность**: оптимизированный компонент Radix UI

### 🎨 **Дизайн**
- **Группировка**: визуальное объединение связанных опций
- **Типографика**: четкая иерархия информации
- **Цветовая схема**: соответствие дизайн-системе

## Результат

Радиокнопки теперь имеют:
- ✅ **Профессиональный внешний вид** с современными стилями
- ✅ **Улучшенную читаемость** с разделенными заголовками и описаниями
- ✅ **Лучшую доступность** благодаря Radix UI
- ✅ **Консистентность** с остальными компонентами приложения
- ✅ **Интуитивное взаимодействие** с визуальной обратной связью

Пользователи теперь получают более приятный и понятный интерфейс при выборе типа создания дизайна. 
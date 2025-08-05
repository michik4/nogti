# DebugModal Component

## Описание
Глобальный компонент для отладки с модальным окном, который отображает кнопку с иконкой жука (bug) в правом нижнем углу экрана. При клике открывается модальное окно с детальной информацией о переданных данных.

## Особенности
- **Автоматическое скрытие в продакшене**: Компонент не отображается в production режиме, если не указан параметр `showInProduction: true`
- **Детальная информация**: Показывает тип данных, ключи объекта, полное JSON представление
- **Синтаксическая подсветка JSON**: Ключи, значения, числа и булевы значения выделяются разными цветами
- **Копирование в буфер обмена**: Кнопка для копирования всего JSON в буфер обмена
- **Поддержка темной темы**: Автоматическая адаптация под системную тему
- **Кнопка вывода в консоль**: Позволяет быстро вывести данные в консоль браузера
- **Адаптивный дизайн**: Модальное окно адаптируется под размер экрана

## Использование

### Базовое использование
```tsx
import DebugModal from '@/components/DebugModal';

// В компоненте
<DebugModal 
  data={someData} 
  title="Отладка компонента" 
/>
```

### С параметрами
```tsx
<DebugModal 
  data={{
    user,
    selectedItem,
    formData,
    state: currentState
  }}
  title="Отладка формы"
  showInProduction={false} // по умолчанию
/>
```

## Props

| Prop | Тип | Обязательный | По умолчанию | Описание |
|------|-----|--------------|--------------|----------|
| `data` | `any` | ✅ | - | Данные для отображения в модальном окне |
| `title` | `string` | ❌ | "Отладочная информация" | Заголовок модального окна |
| `showInProduction` | `boolean` | ❌ | `false` | Показывать ли компонент в production режиме |

## Примеры использования

### Отладка состояния компонента
```tsx
const [selectedDesign, setSelectedDesign] = useState(null);
const [user, setUser] = useState(null);

return (
  <div>
    {/* Ваш компонент */}
    <DebugModal 
      data={{
        selectedDesign,
        user,
        isAuthenticated: user !== null
      }}
      title="Отладка состояния"
    />
  </div>
);
```

### Отладка формы
```tsx
const [formData, setFormData] = useState({});

return (
  <form>
    {/* Поля формы */}
    <DebugModal 
      data={formData}
      title="Данные формы"
    />
  </form>
);
```

### Отладка API ответов
```tsx
const { data, loading, error } = useApi('/api/endpoint');

return (
  <div>
    {/* Контент */}
    <DebugModal 
      data={{
        data,
        loading,
        error,
        timestamp: new Date().toISOString()
      }}
      title="API Debug"
    />
  </div>
);
```

## Стилизация

Компонент использует CSS модуль `DebugModal.module.css` со следующими классами:

### Основные классы:
- `.debugButton` - стили для кнопки отладки
- `.debugModal` - стили для модального окна
- `.debugHeader` - стили для заголовка
- `.debugSection` - базовые стили для секций
- `.debugDataSection` - секция с данными (серый фон)
- `.debugTypeSection` - секция с типом данных (синий фон)
- `.debugKeysSection` - секция с ключами объекта (зеленый фон)

### Дополнительные классы:
- `.debugDataTitle` - заголовки секций
- `.debugDataContent` - контейнер для JSON данных
- `.debugTypeText` - текст с информацией о типе
- `.debugKeysContainer` - контейнер для ключей
- `.debugKeyTag` - теги ключей объекта
- `.debugActions` - контейнер для кнопок действий

### Адаптивность:
- Медиа-запрос для мобильных устройств (max-width: 768px)
- Адаптивное позиционирование кнопки
- Вертикальное расположение кнопок на мобильных

## Безопасность

- Компонент автоматически скрывается в production режиме
- Можно принудительно показать в production через `showInProduction: true`
- Рекомендуется использовать только для разработки и отладки

## Зависимости

- `@/components/ui/button`
- `@/components/ui/dialog`
- `lucide-react` (для иконки Bug) 
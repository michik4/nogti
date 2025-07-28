# Интеграция записи на странице дизайна

## Обзор

Интегрировано модальное окно записи (`BookingModal`) в карточки услуг мастеров на странице просмотра дизайна. Теперь пользователи могут записаться к мастеру прямо с страницы дизайна, выбрав конкретную услугу.

## Архитектура

### Компоненты
- **DesignPage** - основная страница дизайна
- **MasterInfo** - компонент с информацией о мастерах и их услугах
- **ServiceCard** - карточка услуги мастера (используется повторно из существующего кода)
- **BookingModal** - модальное окно записи

### Поток данных
```
DesignPage → MasterInfo → ServiceCard → BookingModal
```

## Реализация

### 1. Обновленный MasterInfo компонент

#### Новые импорты
```typescript
import { MasterWithServicesForDesign, MasterService, MasterServiceForDesign } from '@/types/master.types';
import BookingModal from '@/components/BookingModal';
```

#### Новое состояние
```typescript
// Состояние для модального окна записи
const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
const [selectedService, setSelectedService] = useState<MasterService | null>(null);
const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
```

#### Обработчик записи
```typescript
const handleServiceBooking = (serviceId: string, serviceName: string) => {
  // Проверка авторизации и роли пользователя
  if (!isClient()) {
    // Показ соответствующих сообщений для разных типов пользователей
    return;
  }

  // Поиск услуги и мастера
  let targetServiceForDesign: MasterServiceForDesign | null = null;
  let targetMasterId: string | null = null;

  for (const masterWithServices of masters) {
    const service = masterWithServices.services.find(s => s.id === serviceId);
    if (service) {
      targetServiceForDesign = service;
      targetMasterId = masterWithServices.master.id;
      break;
    }
  }

  // Адаптация типов для BookingModal
  const adaptedService: MasterService = {
    id: targetServiceForDesign.id,
    name: targetServiceForDesign.name,
    description: targetServiceForDesign.description,
    price: targetServiceForDesign.totalPrice,
    duration: targetServiceForDesign.totalDuration,
    isActive: targetServiceForDesign.isActive,
    createdAt: targetServiceForDesign.createdAt,
    updatedAt: targetServiceForDesign.updatedAt
  };

  // Открытие модального окна
  setSelectedService(adaptedService);
  setSelectedMasterId(targetMasterId);
  setIsBookingModalOpen(true);
};
```

### 2. Адаптация типов

**Проблема**: `BookingModal` ожидает тип `MasterService`, а в контексте дизайна используется `MasterServiceForDesign`

**Решение**: Создан адаптер типов:
- `totalPrice` → `price`
- `totalDuration` → `duration`
- Остальные поля остаются без изменений

### 3. Интеграция в JSX

```typescript
return (
  <>
    <Card className={styles.masterCard}>
      {/* Существующий контент */}
    </Card>
    
    {/* Модальное окно записи */}
    <BookingModal
      isOpen={isBookingModalOpen}
      onClose={handleBookingModalClose}
      service={selectedService}
      masterId={selectedMasterId || undefined}
    />
  </>
);
```

## Проверки доступности

### 1. Проверка роли пользователя
- **Клиент**: может записаться
- **Гость**: показывается предложение регистрации
- **Мастер**: уведомление о недоступности
- **Неавторизованный**: предложение войти в систему

### 2. Проверка состояния услуги
- Услуга должна быть активной (`isActive: true`)
- Мастер должен быть активным
- Услуга должна существовать в системе

## Пользовательский опыт

### Сценарий записи
1. **Пользователь просматривает дизайн**
2. **Видит список мастеров, которые могут выполнить этот дизайн**
3. **В каждой карточке мастера показаны его услуги для данного дизайна**
4. **Нажимает "Записаться" на понравившейся услуге**
5. **Открывается модальное окно записи с предзаполненной услугой**
6. **Выбирает дату, время и создает запись**

### Преимущества интеграции
- **Удобство**: запись прямо с страницы дизайна
- **Контекст**: пользователь видит, какой именно дизайн будет выполняться
- **Выбор**: может сравнить услуги разных мастеров для одного дизайна
- **Прозрачность**: видит точную цену услуги с учетом дизайна

## Техническая документация

### Структура данных

#### MasterServiceForDesign (используется в контексте дизайна)
```typescript
interface MasterServiceForDesign {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  baseDuration: number;
  customPrice?: number;
  additionalDuration?: number;
  totalPrice: number;        // Итоговая цена (basePrice + customPrice)
  totalDuration: number;     // Итоговое время (baseDuration + additionalDuration)
  notes?: string;
  isActive: boolean;
}
```

#### MasterService (ожидается BookingModal)
```typescript
interface MasterService {
  id: string;
  name: string;
  description?: string;
  price: number;            // Прямая цена
  duration: number;         // Прямое время
  isActive: boolean;
}
```

### Адаптация данных
```typescript
const adaptedService: MasterService = {
  id: targetServiceForDesign.id,
  name: targetServiceForDesign.name,
  description: targetServiceForDesign.description,
  price: targetServiceForDesign.totalPrice,     // Используем итоговую цену
  duration: targetServiceForDesign.totalDuration, // Используем итоговое время
  isActive: targetServiceForDesign.isActive,
  createdAt: targetServiceForDesign.createdAt,
  updatedAt: targetServiceForDesign.updatedAt
};
```

## Тестирование

### Сценарии для тестирования
1. **Авторизованный клиент** - должен видеть кнопки "Записаться" и успешно записываться
2. **Неавторизованный пользователь** - должен видеть предложение войти
3. **Гость** - должен видеть предложение регистрации
4. **Мастер** - должен видеть уведомление о недоступности
5. **Неактивная услуга** - кнопка записи не должна отображаться
6. **Адаптация типов** - цены и время должны корректно передаваться в BookingModal

### Проверка интеграции
- Модальное окно должно открываться с правильными данными услуги
- ID мастера должен корректно передаваться
- После успешной записи модальное окно должно закрываться
- Уведомления должны показываться в соответствующих случаях

## Будущие улучшения

1. **Предзаполнение дизайна в BookingModal** - автоматический выбор текущего дизайна ✅ **РЕАЛИЗОВАНО**
2. **Фильтрация услуг** - показ только тех услуг, которые подходят для конкретного дизайна
3. **Сравнение услуг** - возможность сравнить цены и условия разных мастеров
4. **Избранные мастера** - быстрый доступ к услугам избранных мастеров
5. **Уведомления о доступности** - подписка на уведомления когда мастер становится доступен

## Предвыбор дизайна (новая функциональность)

### Обзор
Реализована функциональность автоматического выбора текущего дизайна при записи со страницы дизайна. Теперь когда пользователь нажимает "Записаться" на странице конкретного дизайна, этот дизайн автоматически выбирается в модальном окне записи.

### Реализация

#### 1. Обновленный BookingModal

**Новый пропс:**
```typescript
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: MasterService | null;
  masterId?: string;
  preselectedDesignId?: string; // ID предвыбранного дизайна
}
```

**Логика предвыбора:**
```typescript
// Передача предвыбранного дизайна в DesignSelector
<DesignSelector
  serviceId={service.id}
  selectedDesignId={preselectedDesignId || selectedDesign?.nailDesign.id}
  onDesignSelect={handleDesignSelect}
/>

// Сброс формы с сохранением предвыбранного дизайна
const resetForm = () => {
  setSelectedDate(undefined);
  setSelectedTime("");
  // Если нет предвыбранного дизайна, сбрасываем выбор дизайна
  if (!preselectedDesignId) {
    setSelectedDesign(null);
  }
  setClientInfo({ name: "", phone: "", email: "", notes: "" });
};
```

#### 2. Обновленный DesignSelector

**Автоматическая установка предвыбранного дизайна:**
```typescript
useEffect(() => {
  const fetchDesigns = async () => {
    try {
      const serviceDesigns = await masterService.getServiceDesigns(serviceId);
      setDesigns(serviceDesigns);
      
      // Если есть предвыбранный дизайн, найдем его в загруженных и установим
      if (selectedDesignId) {
        const preselectedDesign = serviceDesigns.find(
          design => design.nailDesign.id === selectedDesignId
        );
        if (preselectedDesign) {
          onDesignSelect(preselectedDesign);
        }
      }
    } catch (error) {
      // обработка ошибок
    }
  };

  if (serviceId) {
    fetchDesigns();
  }
}, [serviceId, selectedDesignId, onDesignSelect]);
```

#### 3. Интеграция в MasterInfo

**Передача designId:**
```typescript
<BookingModal
  isOpen={isBookingModalOpen}
  onClose={handleBookingModalClose}
  service={selectedService}
  masterId={selectedMasterId || undefined}
  preselectedDesignId={designId}
/>
```

### Пользовательский опыт

#### Сценарий с предвыбором дизайна
1. **Пользователь просматривает конкретный дизайн**
2. **Видит список мастеров, которые могут выполнить этот дизайн**
3. **Нажимает "Записаться" на понравившейся услуге**
4. **Модальное окно записи открывается с уже выбранным текущим дизайном** ✅
5. **Пользователь может изменить выбор дизайна или оставить текущий**
6. **Выбирает дату, время и создает запись**

#### Преимущества предвыбора
- **Удобство**: не нужно искать и выбирать дизайн заново
- **Логичность**: естественное продолжение просмотра дизайна
- **Скорость**: меньше действий для создания записи
- **Контекст**: сохраняется связь между просматриваемым дизайном и записью

### Технические детали

#### Поток данных для предвыбора
```
DesignPage (designId) → MasterInfo (designId) → BookingModal (preselectedDesignId) → DesignSelector (selectedDesignId)
```

#### Логика сброса состояния
- **При успешной записи**: форма сбрасывается, но предвыбранный дизайн остается
- **При закрытии модального окна**: форма сбрасывается автоматически
- **При смене услуги**: предвыбранный дизайн проверяется на доступность для новой услуги

#### Обработка краевых случаев
1. **Дизайн не найден в услуге**: предвыбор игнорируется, показывается обычный список
2. **Услуга не поддерживает дизайн**: предвыбор игнорируется
3. **Пользователь меняет выбор**: новый выбор сохраняется как обычно
4. **Сброс выбора**: пользователь может снять выбор дизайна кнопкой "Без дизайна"

### Тестирование предвыбора

#### Сценарии для проверки
1. **Запись со страницы дизайна** - дизайн должен быть предвыбран
2. **Обычная запись (не со страницы дизайна)** - работает как раньше
3. **Смена дизайна** - пользователь может выбрать другой дизайн
4. **Сброс выбора** - кнопка "Без дизайна" работает корректно
5. **Сброс формы** - предвыбранный дизайн сохраняется при сбросе
6. **Закрытие и повторное открытие** - предвыбор работает повторно

#### Проверка доступности дизайна
- Дизайн должен быть привязан к выбранной услуге
- Дизайн должен быть активным и модерированным
- При отсутствии дизайна в услуге предвыбор игнорируется 
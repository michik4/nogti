# Документация по реализации клиентского сервиса

## Содержание
1. [Общая архитектура](#общая-архитектура)
2. [Типы данных](#типы-данных)
3. [Авторизация](#авторизация)
4. [Основные модули](#основные-модули)
5. [Интерфейсы](#интерфейсы)
6. [Рекомендации по реализации](#рекомендации-по-реализации)

## Общая архитектура

### Базовая структура проекта
```
src/
  ├── api/              # API клиент и интерфейсы
  ├── components/       # React компоненты
  ├── contexts/         # React контексты
  ├── hooks/           # Кастомные хуки
  ├── pages/           # Страницы приложения
  ├── store/           # Управление состоянием
  ├── types/           # TypeScript типы
  └── utils/           # Вспомогательные функции
```

### Основные зависимости
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "react-query": "^4.x",
    "@mantine/core": "^6.x",
    "@mantine/dates": "^6.x",
    "date-fns": "^2.x",
    "leaflet": "^1.x"
  }
}
```

## Типы данных

### Основные интерфейсы

```typescript
// types/user.types.ts
export type UserRole = 'client' | 'nailmaster' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  avatar?: string;
}

// types/design.types.ts
export interface NailDesign {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  complexity: number;
  likesCount: number;
  isLiked?: boolean;
  category: 'basic' | 'designer';
  tags: string[];
}

// types/master.types.ts
export interface Master {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  portfolio: string[];
  canDoDesigns: string[]; // ID дизайнов
  workingHours: WorkingHours;
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
    isWorking: boolean;
  };
}

// types/order.types.ts
export interface Order {
  id: string;
  clientId: string;
  masterId: string;
  designId: string;
  status: OrderStatus;
  appointmentTime: string;
  proposedTime?: string;
  price: number;
  createdAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'time_proposed'
  | 'completed'
  | 'cancelled';
```

## Авторизация

### Хранение токенов
```typescript
// utils/auth.ts
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const setTokens = (token: string, refreshToken: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
```

### Контекст авторизации
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Реализация методов...
};
```

## Основные модули

### Каталог дизайнов

```typescript
// hooks/useDesigns.ts
export const useDesigns = (params: DesignSearchParams) => {
  return useQuery(['designs', params], () => 
    api.designs.getList(params)
  );
};

// components/DesignCard.tsx
interface DesignCardProps {
  design: NailDesign;
  onBook?: () => void;
  onLike?: () => void;
}

// components/DesignGrid.tsx
interface DesignGridProps {
  designs: NailDesign[];
  loading?: boolean;
  onLoadMore?: () => void;
}
```

### Запись к мастеру

```typescript
// components/BookingFlow/index.tsx
export const BookingFlow: React.FC<{
  designId: string;
  onComplete: (orderId: string) => void;
}> = ({ designId, onComplete }) => {
  const [step, setStep] = useState<'masters' | 'time' | 'confirm'>('masters');
  
  // Логика пошагового процесса записи
};

// hooks/useNearbyMasters.ts
export const useNearbyMasters = (params: {
  designId: string;
  lat: number;
  lng: number;
  radius: number;
}) => {
  return useQuery(['nearbyMasters', params], () =>
    api.masters.getNearby(params)
  );
};
```

### Личный кабинет мастера

```typescript
// components/MasterProfile/Schedule.tsx
interface ScheduleProps {
  workingHours: WorkingHours;
  onUpdate: (hours: WorkingHours) => Promise<void>;
}

// components/MasterProfile/CanDoList.tsx
interface CanDoListProps {
  designs: NailDesign[];
  onRemove: (designId: string) => Promise<void>;
}
```

## Интерфейсы

### Главная страница
- Бесконечная лента дизайнов
- Фильтры и поиск
- Быстрый доступ к избранному
- Навигация по категориям

### Страница дизайна
- Галерея изображений
- Информация о дизайне
- Кнопка "Записаться"
- Список ближайших мастеров
- Отзывы и рейтинг

### Личный кабинет клиента
- Профиль и настройки
- История заказов
- Избранные дизайны
- Уведомления

### Личный кабинет мастера
- Управление профилем
- Календарь записей
- Управление портфолио
- Список "Я так могу"
- Статистика и рейтинг

## Интеграция сервисов

### Готовые сервисы
В клиентской части уже созданы готовые сервисы для работы с API:

```typescript
// Импорт сервисов
import { 
  authService, 
  designsService, 
  mastersService, 
  ordersService 
} from '@/services';

// Использование в компонентах
const LoginComponent = () => {
  const handleLogin = async (credentials) => {
    try {
      const authData = await authService.login(credentials);
      // Обработка успешной авторизации
    } catch (error) {
      // Обработка ошибки
    }
  };
};
```

### Структура сервисов
- `apiService` - базовый HTTP клиент с автоматической обработкой токенов
- `authService` - авторизация и управление пользователями
- `designsService` - работа с каталогом дизайнов
- `mastersService` - управление профилями мастеров и поиск
- `ordersService` - создание и управление заказами

## Рекомендации по реализации

### MVP Функционал
1. Базовая авторизация ✅ (готов сервис)
2. Просмотр каталога дизайнов ✅ (готов сервис)
3. Поиск мастеров по геолокации ✅ (готов сервис)
4. Процесс записи ✅ (готов сервис)
5. Управление записями для мастера ✅ (готов сервис)

### Оптимизация производительности
1. Использовать виртуализацию для длинных списков
2. Кэширование данных через React Query
3. Ленивая загрузка изображений
4. Code splitting по маршрутам

### Работа с геолокацией
```typescript
// utils/geo.ts
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// Хук для получения координат
export const useGeolocation = () => {
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then(position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      })
      .catch(err => setError(err.message));
  }, []);

  return { location, error };
};
```

### Уведомления
```typescript
// utils/notifications.ts
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Хук для управления уведомлениями
export const useNotifications = () => {
  const [permission, setPermission] = useState<boolean>(false);

  useEffect(() => {
    requestNotificationPermission().then(setPermission);
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission) {
      new Notification(title, options);
    }
  }, [permission]);

  return { permission, showNotification };
};
```

### Безопасность
1. Все запросы к API должны использовать HTTPS
2. Токены должны храниться только в памяти или secure cookies
3. Валидация всех пользовательских данных
4. Защита от XSS и CSRF атак

### SEO оптимизация
1. Использовать семантическую разметку
2. Добавить мета-теги для соцсетей
3. Реализовать SSR для основных страниц
4. Создать sitemap.xml

### Мониторинг и аналитика
1. Интеграция с Google Analytics
2. Отслеживание пользовательских действий
3. Мониторинг ошибок через Sentry
4. Сбор метрик производительности 
# Система аутентификации клиентского приложения

## Обзор

Реализована полноценная система аутентификации с интеграцией серверного API, поддержкой JWT токенов и автоматическим обновлением сессий.

## Архитектура

### Основные компоненты

1. **AuthService** (`/services/authService.ts`) - основной сервис для работы с аутентификацией
2. **AuthContext** (`/contexts/AuthContext.tsx`) - React контекст для управления состоянием аутентификации
3. **ProtectedRoute** (`/components/ProtectedRoute.tsx`) - компонент для защиты маршрутов
4. **API Service** (`/services/api.ts`) - базовый HTTP клиент с поддержкой JWT

### Типы данных

- **User types** (`/types/user.types.ts`) - типы пользователей (Client, Master, Admin, Guest)
- **API types** (`/types/api.types.ts`) - типы для API запросов и ответов

## React.StrictMode и дублирование запросов

### Проблема
В development режиме при использовании React.StrictMode могут возникать дублированные запросы к API, особенно при инициализации аутентификации.

### Причина
React.StrictMode намеренно дважды выполняет:
- Рендеринг компонентов
- Выполнение `useEffect`
- Вызовы функций состояния

Это помогает выявить побочные эффекты и проблемы с состоянием.

### Решение
AuthProvider содержит защиту от множественных одновременных инициализаций через флаг `isInitializing`. Это предотвращает дублирование запросов при сохранении преимуществ StrictMode.

```typescript
const [isInitializing, setIsInitializing] = useState(false);

const initializeAuth = async () => {
  if (isInitializing) {
    return; // Предотвращаем дублирование
  }
  // ... логика инициализации
};
```

### Важно
- В production сборке StrictMode автоматически отключается
- Дублирование запросов в development - это нормальное поведение
- Не рекомендуется отключать StrictMode для решения этой проблемы

## Использование

### Базовая аутентификация

```tsx
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Ошибка входа:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Добро пожаловать, {user?.fullName}!</p>
          <button onClick={logout}>Выйти</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Войти</button>
      )}
    </div>
  );
};
```

### Защищенные маршруты

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Маршрут только для клиентов
<Route 
  path="/profile" 
  element={
    <ProtectedRoute requiredRole="client">
      <Profile />
    </ProtectedRoute>
  } 
/>

// Маршрут только для мастеров
<Route 
  path="/master-dashboard" 
  element={
    <ProtectedRoute requiredRole="nailmaster">
      <MasterDashboard />
    </ProtectedRoute>
  } 
/>
```

### Проверка ролей

```tsx
const { isClient, isMaster, isAdmin } = useAuth();

if (isClient()) {
  // Логика для клиентов
} else if (isMaster()) {
  // Логика для мастеров
} else if (isAdmin()) {
  // Логика для администраторов
}
```

### API запросы с аутентификацией

```tsx
import { apiService } from '@/services';

// Запрос с автоматическим добавлением токена
const response = await apiService.get('/protected-endpoint');

// Запрос без токена (для публичных эндпоинтов)
const publicResponse = await apiService.get('/public-endpoint', false);
```

### Использование хука useAuthApi

```tsx
import { useAuthApi } from '@/hooks/useAuthApi';
import { apiService } from '@/services';

const MyComponent = () => {
  const { data, loading, error, execute } = useAuthApi<UserProfile>();

  const loadProfile = () => {
    execute(() => apiService.get('/auth/profile'));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return <div>Профиль: {data?.fullName}</div>;
};
```

## Функции

### AuthService

- `login(credentials)` - авторизация пользователя
- `register(userData)` - регистрация нового пользователя
- `logout()` - выход из системы
- `isAuthenticated()` - проверка аутентификации
- `getCurrentUser()` - получение текущего пользователя
- `hasRole(role)` - проверка роли пользователя
- `refreshToken()` - обновление токена (автоматически)

### AuthContext

- `user` - текущий пользователь
- `isAuthenticated` - статус аутентификации
- `isLoading` - состояние загрузки
- `login()` - авторизация
- `register()` - регистрация
- `logout()` - выход
- `createGuestSession()` - создание гостевой сессии
- `convertGuestToUser()` - преобразование гостя в пользователя

## Безопасность

### JWT токены

- **Access Token** - для API запросов (короткое время жизни)
- **Refresh Token** - для обновления access токена (длительное время жизни)
- Автоматическое обновление при истечении access токена
- Безопасное хранение в localStorage

### Автоматическое обновление токенов

При получении 401 ошибки система автоматически:
1. Пытается обновить токен через refresh token
2. Повторяет оригинальный запрос с новым токеном
3. При неудаче очищает токены и перенаправляет на страницу входа

### Защита маршрутов

- Автоматическая проверка аутентификации
- Проверка ролей пользователя
- Сохранение исходного маршрута для редиректа после входа

## Гостевые сессии

Поддержка временных аккаунтов для неавторизованных пользователей:

```tsx
const { createGuestSession, convertGuestToUser } = useAuth();

// Создание гостевой сессии
const guest = createGuestSession();

// Преобразование в постоянный аккаунт
await convertGuestToUser('client', {
  email: 'user@example.com',
  password: 'password',
  fullName: 'Имя пользователя'
});
```

## Интеграция с сервером

### Эндпоинты

- `POST /api/auth/login` - авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/refresh` - обновление токена
- `POST /api/auth/register-admin` - регистрация администратора

### Формат запросов

```typescript
// Авторизация
{
  email?: string;
  phone?: string;
  password: string;
}

// Регистрация
{
  email: string;
  username: string;
  password: string;
  role: 'client' | 'nailmaster';
  fullName?: string;
  phone?: string;
}
```

### Формат ответов

```typescript
{
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
      fullName?: string;
    };
    token: string;
    refreshToken: string;
  };
  message?: string;
  error?: string;
}
```

## Миграция со старой системы

Старые компоненты, использующие `UserContext`, должны быть обновлены:

```tsx
// Старый способ
import { useUser } from '@/contexts/UserContext';
const { currentUser, setCurrentUser } = useUser();

// Новый способ
import { useAuth } from '@/contexts/AuthContext';
const { user, login, logout } = useAuth();
```

## Отладка

### Проверка токенов

```javascript
// В консоли браузера
localStorage.getItem('auth_token');
localStorage.getItem('refresh_token');
```

### Логирование

Ошибки аутентификации логируются в консоль:
- Ошибки декодирования токена
- Ошибки обновления токена
- Ошибки API запросов

## Рекомендации

1. **Всегда используйте useAuth** для проверки аутентификации
2. **Оборачивайте приватные маршруты** в ProtectedRoute
3. **Обрабатывайте ошибки** аутентификации в UI
4. **Не храните чувствительные данные** в локальном хранилище
5. **Используйте HTTPS** в продакшене 
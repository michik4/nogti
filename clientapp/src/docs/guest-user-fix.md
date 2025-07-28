# Исправление проблемы с определением гостевых пользователей

## Проблема
В клиентском дашборде отображалось, что зарегистрированный пользователь является временным (гостевым), хотя он был зарегистрирован как постоянный.

## Причина
Проблема была в несоответствии между клиентской и серверной логикой определения гостевых пользователей:

1. **Клиент** проверял поле `type === 'guest'` для локальных гостевых сессий
2. **Сервер** использовал поле `isGuest: boolean` в базе данных
3. При аутентификации сервер не передавал поле `isGuest` в токен и ответах

## Исправления

### 1. Обновление AuthContext (client/src/contexts/AuthContext.tsx)
```typescript
const isGuest = () => {
  // Проверяем как поле type (для локальных гостевых сессий), так и isGuest (для серверных данных)
  return user && (
    ('type' in user && user.type === 'guest') || 
    ('isGuest' in user && user.isGuest === true)
  );
};
```

### 2. Обновление типов пользователей (client/src/types/user.types.ts)
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isGuest?: boolean; // Добавлено поле isGuest из серверной модели
  createdAt?: string;
  updatedAt?: string;
}
```

### 3. Обновление контроллера аутентификации (server/src/controllers/auth.controller.ts)
```typescript
// Включение isGuest в токен
const tokenPayload = {
  userId: user.id,
  email: user.email,
  role: user.role,
  isGuest: user.isGuest,
  fullName: (user as any).fullName,
  phone: (user as any).phone
};

// Включение isGuest в ответ
const authResponse: AuthResponse = {
  user: {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    fullName: (user as any).fullName,
    isGuest: user.isGuest
  },
  token: accessToken,
  refreshToken: refreshToken
};
```

### 4. Обновление типов API
```typescript
// server/src/types/api.type.ts и client/src/types/api.types.ts
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  isGuest?: boolean;
  fullName?: string;
  phone?: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    fullName?: string;
    isGuest?: boolean;
  };
  token: string;
  refreshToken: string;
}
```

### 5. Обновление authService (client/src/services/authService.ts)
```typescript
getCurrentUser(): User | null {
  const token = this.getToken();
  if (!token) return null;

  const payload = this.decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    username: payload.username || payload.email,
    role: payload.role as any,
    fullName: payload.fullName,
    phone: payload.phone,
    isGuest: payload.isGuest, // Добавлено поле isGuest
  };
}
```

### 6. Улучшение очистки гостевых сессий
Добавлена автоматическая очистка localStorage от гостевых сессий при успешной аутентификации в нескольких местах:
- При инициализации с действующим токеном
- При логине
- При регистрации
- При обновлении пользователя

## Результат
Теперь система корректно определяет тип пользователя:
- Зарегистрированные пользователи имеют `isGuest: false`
- Гостевые сессии имеют `type: 'guest'` или `isGuest: true`
- Старые гостевые сессии автоматически очищаются при аутентификации 
# Переработка метода getCurrentUser в AuthService

## Описание изменений

Метод `getCurrentUser` в `AuthService` был переработан для получения данных пользователя с сервера вместо извлечения из JWT токена.

## Основные изменения

### 1. Метод getCurrentUser
- **Было**: Синхронный метод, извлекающий данные из JWT токена
- **Стало**: Асинхронный метод, получающий данные с сервера через `/auth/profile`

```typescript
// Старая версия
getCurrentUser(): User | null {
  const token = this.getToken();
  const payload = this.decodeToken(token);
  // ... извлечение данных из JWT
}

// Новая версия
async getCurrentUser(): Promise<User | null> {
  if (!this.isAuthenticated()) return null;
  
  const response = await apiService.get<User>('/auth/profile');
  if (response.success && response.data) {
    return response.data;
  }
  // ... обработка ошибок
}
```

### 2. Метод getCurrentUserTyped
- **Было**: Синхронный метод
- **Стало**: Асинхронный метод

```typescript
// Старая версия
getCurrentUserTyped(): Client | Master | Admin | null {
  const user = this.getCurrentUser();
  // ...
}

// Новая версия
async getCurrentUserTyped(): Promise<Client | Master | Admin | null> {
  const user = await this.getCurrentUser();
  // ...
}
```

### 3. Новые асинхронные методы проверки ролей
Добавлены асинхронные версии методов проверки ролей для случаев, когда нужны актуальные данные с сервера:

- `hasRoleAsync(role: string): Promise<boolean>`
- `isClientAsync(): Promise<boolean>`
- `isMasterAsync(): Promise<boolean>`
- `isAdminAsync(): Promise<boolean>`

### 4. Сохранены синхронные методы
Для быстрых проверок сохранены синхронные методы, которые работают с JWT токеном:
- `hasRole(role: string): boolean`
- `isClient(): boolean`
- `isMaster(): boolean`
- `isAdmin(): boolean`

## Преимущества изменений

1. **Актуальность данных**: Данные всегда получаются с сервера, что гарантирует их актуальность
2. **Безопасность**: Уменьшается зависимость от данных в JWT токене
3. **Гибкость**: Сервер может возвращать дополнительные поля, которые не хранятся в токене
4. **Обработка ошибок**: Лучшая обработка ошибок сети и сервера

## Обратная совместимость

- Синхронные методы проверки ролей сохранены для быстрых проверок
- Все существующие вызовы в `AuthContext` обновлены на асинхронные версии
- Fallback на JWT токен сохранен в критических случаях

## Использование

### Для получения актуальных данных пользователя:
```typescript
const user = await authService.getCurrentUser();
const typedUser = await authService.getCurrentUserTyped();
```

### Для быстрых проверок ролей:
```typescript
if (authService.isClient()) {
  // Быстрая проверка через JWT
}
```

### Для проверок с актуальными данными:
```typescript
if (await authService.isClientAsync()) {
  // Проверка с данными с сервера
}
```

## Обработка ошибок

При ошибках получения данных с сервера:
1. Токены автоматически очищаются
2. Пользователь перенаправляется на страницу входа
3. Логируются детали ошибки для отладки 
# Исправление проблемы с перевыпуском токенов

## Проблема

После изменения email в профиле пользователя возникала проблема с несоответствием данных в JWT токене и базе данных:

```
PUT /api/auth/profile 200 7.002 ms - 530
[AuthMiddleware] Отладка JWT:
- Token (первые 20 символов): eyJhbGciOiJIUzI1NiIs...
- Decoded payload: {
  userId: 'c9000369-ce51-4688-9ae6-db6b4f65e0b6',
  email: 'client1@prometai.com',  // Старый email
  username: 'client_oksana',
  role: 'client',
  isGuest: false,
  fullName: 'Оксана Иванова',
  phone: '+7-900-444-4444',
  iat: 1754240824,
  exp: 1754327224
}
- User from DB: {
  id: 'c9000369-ce51-4688-9ae6-db6b4f65e0b6',
  email: 'client12@prometai.com',  // Новый email
  role: 'client'
}
```

## Причина

После обновления профиля через API эндпоинт `/auth/profile` или `/masters/profile`, JWT токен содержал старые данные, а сервер искал пользователя по новым данным, что приводило к несоответствию.

## Решение

### Серверная сторона

#### 1. Обновление AuthController.updateProfile

```typescript
// server/src/controllers/auth.controller.ts
static async updateProfile(req: Request, res: Response): Promise<void> {
  // ... существующий код ...
  
  // Генерируем новые токены с обновленными данными
  const tokenPayload = {
    userId: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    role: updatedUser.role,
    isGuest: updatedUser.isGuest,
    fullName: (updatedUser as any).fullName,
    phone: (updatedUser as any).phone,
    avatar: (updatedUser as any).avatar
  };

  const accessToken = JwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

  const authResponse: AuthResponse = {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      fullName: (updatedUser as any).fullName,
      isGuest: updatedUser.isGuest,
      avatar: (updatedUser as any).avatar
    },
    token: accessToken,
    refreshToken: refreshToken
  };

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: authResponse,
    message: 'Профиль успешно обновлен. Новые токены сгенерированы.'
  };

  res.json(response);
}
```

#### 2. Обновление MasterController.updateMasterProfile

```typescript
// server/src/controllers/master.controller.ts
static async updateMasterProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  // ... существующий код ...
  
  // Генерируем новые токены с обновленными данными
  const tokenPayload = {
    userId: updatedMaster.id,
    email: updatedMaster.email,
    username: updatedMaster.username,
    role: updatedMaster.role,
    isGuest: updatedMaster.isGuest,
    fullName: updatedMaster.fullName,
    phone: updatedMaster.phone,
    avatar: (updatedMaster as any).avatar
  };

  const accessToken = JwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

  const authResponse: AuthResponse = {
    user: {
      id: updatedMaster.id,
      email: updatedMaster.email,
      username: updatedMaster.username,
      role: updatedMaster.role,
      fullName: updatedMaster.fullName,
      isGuest: updatedMaster.isGuest,
      avatar: (updatedMaster as any).avatar
    },
    token: accessToken,
    refreshToken: refreshToken
  };

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: authResponse,
    message: 'Профиль мастера успешно обновлен. Новые токены сгенерированы.'
  };

  res.json(response);
}
```

### Клиентская сторона

#### 1. Обновление userService.updateProfile

```typescript
// clientapp/src/services/userService.ts
async updateProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<AuthResponse>> {
  const response = await apiService.put<AuthResponse>(`/auth/profile`, updates);
  
  // Если обновление прошло успешно и получены новые токены, обновляем их
  if (response.success && response.data && response.data.token && response.data.refreshToken) {
    console.log('Получены новые токены после обновления профиля');
    apiService.setTokens(response.data.token, response.data.refreshToken);
  }
  
  return response;
}
```

#### 2. Обновление masterService.updateMasterProfile

```typescript
// clientapp/src/services/masterService.ts
updateMasterProfile: async (data: Partial<Master>): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.put<AuthResponse>('/masters/profile', data);
  
  // Если обновление прошло успешно и получены новые токены, обновляем их
  if (response.success && response.data && response.data.token && response.data.refreshToken) {
    console.log('Получены новые токены после обновления профиля мастера');
    api.setTokens(response.data.token, response.data.refreshToken);
  }
  
  return response;
}
```

#### 3. Обновление EditProfileModal

```typescript
// clientapp/src/components/EditProfileModal.tsx
const updateUserProfile = async (data: any) => {
  try {
    // ... существующий код ...
    
    const response = await userService.updateProfile('', updateData);
    
    if (response.success) {
      // Не вызываем refreshUser здесь, так как это может вызвать цикличный рендер
      // Токены уже обновлены в userService.updateProfile
      console.log('Профиль клиента успешно обновлен:', response.data);
      
      return response.data;
    } else {
      throw new Error(response.message || 'Ошибка обновления профиля');
    }
  } catch (error) {
    console.error('Ошибка обновления профиля клиента:', error);
    throw error;
  }
};
```

## Преимущества решения

1. **Актуальные данные**: JWT токен всегда содержит актуальные данные пользователя
2. **Автоматическое обновление**: Токены обновляются автоматически после изменения профиля
3. **Обратная совместимость**: Существующие токены продолжают работать до истечения срока действия
4. **Безопасность**: Новые токены содержат только актуальные данные

## Тестирование

### Ручное тестирование

1. Войти в систему как клиент или мастер
2. Открыть форму редактирования профиля
3. Изменить email на новый
4. Сохранить изменения
5. Проверить, что новые данные отображаются корректно
6. Проверить, что новые запросы к API работают с обновленными данными

### Автоматическое тестирование

```typescript
// Тест обновления профиля клиента
test('should update client profile and return new tokens', async () => {
  const response = await userService.updateProfile('', {
    fullName: 'Новое имя',
    email: 'newemail@example.com'
  });
  
  expect(response.success).toBe(true);
  expect(response.data.token).toBeDefined();
  expect(response.data.refreshToken).toBeDefined();
  expect(response.data.user.email).toBe('newemail@example.com');
});

// Тест обновления профиля мастера
test('should update master profile and return new tokens', async () => {
  const response = await masterService.updateMasterProfile({
    fullName: 'Новое имя мастера',
    phone: '+7-999-999-9999'
  });
  
  expect(response.success).toBe(true);
  expect(response.data.token).toBeDefined();
  expect(response.data.refreshToken).toBeDefined();
  expect(response.data.user.fullName).toBe('Новое имя мастера');
});
```

## Миграция

### Для существующих пользователей

1. При следующем обновлении профиля токены будут автоматически обновлены
2. Старые токены продолжат работать до истечения срока действия
3. Новые токены будут содержать актуальные данные

### Для разработчиков

1. Обновить клиентские сервисы для обработки новых токенов
2. Обновить компоненты для правильной обработки ответов API
3. Добавить обработку ошибок для случаев, когда токены не обновлены

## Мониторинг

### Логирование

```typescript
// Логирование обновления токенов
console.log('Получены новые токены после обновления профиля');
console.log('Обновляем токены в контексте авторизации');
```

### Метрики

- Количество успешных обновлений профиля
- Количество обновлений токенов
- Время отклика API обновления профиля
- Количество ошибок при обновлении токенов 
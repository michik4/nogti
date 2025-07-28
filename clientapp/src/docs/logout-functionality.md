# Функциональность выхода из системы

## Обзор
Система выхода из учетной записи обеспечивает полную очистку пользовательских данных и состояния приложения.

## Исправления (25.01.2025)

### Проблемы
1. Неполная очистка JWT токенов при выходе
2. Возможность сохранения остаточных данных в localStorage
3. Отсутствие перезагрузки страницы для полной очистки состояния
4. Недостаточное логирование процесса очистки

### Решения

#### 1. Улучшенная кнопка выхода в Header
```typescript
const handleLogout = () => {
  logout();
  toast({
    title: "Выход выполнен",
    description: "Вы успешно вышли из системы.",
  });
  
  // Перезагружаем страницу для полной очистки состояния
  setTimeout(() => {
    window.location.href = "/";
  }, 500); // Небольшая задержка для показа уведомления
};
```

#### 2. Тщательная очистка в AuthContext
```typescript
const logout = () => {
  try {
    // Очищаем данные авторизации
    authService.logout();
    
    // Очищаем гостевую сессию
    clearGuestSession();
    
    // Очищаем состояние пользователя
    setUser(null);
    
    // Дополнительная очистка всех возможных данных пользователя из localStorage
    const keysToRemove = [
      'auth_token',
      'refresh_token', 
      'guestSession',
      'user_preferences',
      'cached_user_data'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Не удалось очистить ${key} из localStorage:`, error);
      }
    });
    
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
    // В случае ошибки всё равно очищаем состояние
    setUser(null);
  }
};
```

#### 3. Надёжная очистка в AuthService
```typescript
logout(): void {
  try {
    // Очищаем токены через apiService
    apiService.clearTokens();
    
    // Дополнительная проверка и очистка токенов
    if (localStorage.getItem('auth_token') || localStorage.getItem('refresh_token')) {
      console.warn('Токены всё ещё найдены после clearTokens, выполняем дополнительную очистку');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    
  } catch (error) {
    console.error('Ошибка при выходе из системы в authService:', error);
    // Принудительная очистка в случае ошибки
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    } catch (storageError) {
      console.error('Критическая ошибка очистки localStorage:', storageError);
    }
  }
}
```

#### 4. Улучшенный clearTokens в ApiService
```typescript
clearTokens(): void {
  try {
    const hadAuthToken = localStorage.getItem('auth_token') !== null;
    const hadRefreshToken = localStorage.getItem('refresh_token') !== null;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Проверяем что токены действительно удалены
    const authTokenStillExists = localStorage.getItem('auth_token') !== null;
    const refreshTokenStillExists = localStorage.getItem('refresh_token') !== null;
    
    if (authTokenStillExists || refreshTokenStillExists) {
      console.error('Критическая ошибка: токены не были удалены из localStorage');
    } else if (hadAuthToken || hadRefreshToken) {
      console.log('Токены успешно очищены из localStorage');
    }
    
  } catch (error) {
    console.error('Ошибка при очистке токенов:', error);
    throw error;
  }
}
```

## Преимущества исправлений

### 1. Полная очистка данных
- Удаление всех токенов аутентификации
- Очистка гостевых сессий
- Удаление дополнительных пользовательских данных
- Перезагрузка страницы для сброса состояния компонентов

### 2. Надёжность
- Множественные уровни проверки
- Обработка ошибок на каждом этапе
- Принудительная очистка в случае сбоев
- Детальное логирование процесса

### 3. Безопасность
- Гарантированное удаление токенов
- Невозможность сохранения остаточных данных
- Полный сброс состояния приложения

## Процесс выхода

1. **Пользователь нажимает кнопку выхода**
2. **AuthContext.logout()** - очистка контекста и localStorage
3. **authService.logout()** - очистка токенов с проверкой
4. **apiService.clearTokens()** - низкоуровневая очистка с логированием
5. **Показ уведомления** - подтверждение выхода
6. **Перезагрузка страницы** - полная очистка состояния

## Тестирование

Для проверки корректности выхода:

1. Авторизуйтесь в системе
2. Проверьте наличие токенов в localStorage (DevTools > Application > Local Storage)
3. Нажмите кнопку выхода
4. Проверьте консоль на предмет логов очистки
5. Убедитесь что токены удалены из localStorage
6. Проверьте что произошла перезагрузка страницы
7. Убедитесь что пользователь не авторизован после перезагрузки 
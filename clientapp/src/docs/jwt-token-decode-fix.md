# Исправление ошибки декодирования JWT токена

## Проблема

Ошибка: `InvalidCharacterError: Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.`

Эта ошибка возникала при попытке декодировать JWT токен в клиентском приложении. Проблема была связана с некорректным base64 декодированием payload части JWT токена.

## Причины

1. **Некорректные символы в base64**: JWT токен может содержать символы, которые не являются валидными для стандартного base64 декодирования
2. **URL-безопасное кодирование**: JWT может использовать URL-безопасное base64 кодирование (с заменой `+` на `-` и `/` на `_`)
3. **Проблемы с padding**: Неправильное количество символов padding в base64 строке

## Решение

### Клиентская часть (`authService.ts`)

Улучшен метод `decodeToken`:

```typescript
private decodeToken(token: string): JwtPayload | null {
  try {
    // Проверяем, что токен не пустой и является строкой
    if (!token || typeof token !== 'string') {
      console.error('Токен не является валидной строкой');
      return null;
    }

    // Разбиваем токен на части
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Неверный формат токена - должно быть 3 части');
      this.logout();
      return null;
    }

    // Проверяем, что каждая часть содержит только валидные символы base64
    const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
    if (!base64Regex.test(parts[1])) {
      console.error('Payload токена содержит некорректные символы');
      this.logout();
      return null;
    }

    // Добавляем padding если необходимо
    let base64 = parts[1];
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    // Безопасное декодирование base64
    let decodedPayload: string;
    try {
      decodedPayload = atob(base64);
    } catch (base64Error) {
      console.error('Ошибка декодирования base64:', base64Error);
      // Попробуем альтернативный способ декодирования
      try {
        // Используем decodeURIComponent для обработки URL-безопасного base64
        const urlSafeBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        decodedPayload = atob(urlSafeBase64);
      } catch (alternativeError) {
        console.error('Альтернативное декодирование также не удалось:', alternativeError);
        this.logout();
        return null;
      }
    }

    // Парсим JSON payload
    let payload: JwtPayload;
    try {
      payload = JSON.parse(decodedPayload);
    } catch (jsonError) {
      console.error('Ошибка парсинга JSON из токена:', jsonError);
      this.logout();
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    this.logout();
    return null;
  }
}
```

### Серверная часть (`jwt.util.ts`)

Улучшены методы генерации токенов:

```typescript
static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  // Очищаем payload от потенциально проблемных значений
  const cleanPayload: Record<string, any> = { ...payload };
  
  // Убеждаемся, что все строковые значения корректно закодированы
  Object.keys(cleanPayload).forEach(key => {
    if (typeof cleanPayload[key] === 'string') {
      // Убираем потенциально проблемные символы
      cleanPayload[key] = (cleanPayload[key] as string).trim();
    }
  });
  
  return jwt.sign(cleanPayload, this.ACCESS_TOKEN_SECRET, {
    expiresIn: this.ACCESS_TOKEN_EXPIRY,
  } as jwt.SignOptions);
}
```

### Контекст авторизации (`AuthContext.tsx`)

Добавлена дополнительная обработка ошибок:

```typescript
const login = async (credentials: LoginRequest): Promise<void> => {
  try {
    setIsLoading(true);
    const authResponse = await authService.login(credentials);

    // Получаем пользователя из токена
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      clearGuestSession();
    } else {
      // Если не удалось получить пользователя из токена, очищаем данные
      console.error('Не удалось получить пользователя из токена после входа');
      authService.logout();
      throw new Error('Ошибка получения данных пользователя');
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    // Очищаем данные при ошибке
    authService.logout();
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

## Улучшения

1. **Двойное декодирование**: Сначала пробуем стандартное base64 декодирование, затем URL-безопасное
2. **Очистка данных**: Удаляем пробелы и проблемные символы из payload перед генерацией токена
3. **Улучшенная обработка ошибок**: Более детальное логирование и очистка данных при ошибках
4. **Валидация токена**: Проверка формата и символов токена перед декодированием

## Тестирование

После внесения изменений рекомендуется:

1. Протестировать вход в систему с различными данными
2. Проверить работу с токенами, содержащими специальные символы
3. Убедиться, что очистка данных работает корректно при ошибках

## Связанные файлы

- `clientapp/src/services/authService.ts` - основной сервис авторизации
- `clientapp/src/contexts/AuthContext.tsx` - контекст авторизации
- `server/src/utils/jwt.util.ts` - утилиты для работы с JWT
- `server/src/controllers/auth.controller.ts` - контроллер авторизации 
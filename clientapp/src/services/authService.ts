import { apiService } from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  JwtPayload, 
  ApiResponse 
} from '@/types/api.types';
import { User, Client, Master, Admin } from '@/types/user.types';

class AuthService {
  /**
   * Инициализация сервиса - очистка некорректных токенов
   */
  initialize(): void {
    try {
      const token = this.getToken();
      if (token) {
        // Проверяем валидность токена при инициализации
        const isValid = this.isAuthenticated();
        if (!isValid) {
          console.warn('Найден некорректный токен при инициализации, очищаем');
          this.logout();
        }
      }
    } catch (error) {
      console.error('Ошибка инициализации AuthService:', error);
      this.logout();
    }
  }

  /**
   * Авторизация пользователя
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials, false);
    
    if (response.success && response.data) {
      const { token, refreshToken } = response.data;
      apiService.setTokens(token, refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка авторизации');
  }

  /**
   * Регистрация нового пользователя
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData, false);
    
    if (response.success && response.data) {
      const { token, refreshToken } = response.data;
      apiService.setTokens(token, refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка регистрации');
  }

  /**
   * Обновление токена доступа
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = apiService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token не найден');
    }

    const response = await apiService.post<AuthResponse>('/auth/refresh', {}, false);
    
    if (response.success && response.data) {
      const { token, refreshToken: newRefreshToken } = response.data;
      apiService.setTokens(token, newRefreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка обновления токена');
  }

  /**
   * Выход из системы
   */
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
      
      // В будущем можно добавить вызов серверного endpoint для инвалидации токена
      // await apiService.post('/auth/logout', {});
      
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

  /**
   * Проверка, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    const token = apiService.getToken();
    if (!token) return false;

    try {
      // Проверяем, не истек ли токен
      const payload = this.decodeToken(token);
      if (!payload) {
        // Если токен некорректный, очищаем его
        apiService.clearTokens();
        return false;
      }

      const currentTime = Date.now() / 1000;
      const isValid = payload.exp ? payload.exp > currentTime : true;
      
      // Если токен истек, очищаем его
      if (!isValid) {
        apiService.clearTokens();
      }
      
      return isValid;
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      // Очищаем токены при ошибке
      apiService.clearTokens();
      return false;
    }
  }

  /**
   * Получение текущего токена
   */
  getToken(): string | null {
    return apiService.getToken();
  }

  /**
   * Декодирование JWT токена
   */
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
        // Очищаем некорректный токен
        this.logout();
        return null;
      }

      // Проверяем, что каждая часть содержит только валидные символы base64
      const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
      if (!base64Regex.test(parts[1])) {
        console.error('Payload токена содержит некорректные символы');
        // Очищаем некорректный токен
        this.logout();
        return null;
      }

      // Добавляем padding если необходимо
      let base64 = parts[1];
      const padding = base64.length % 4;
      if (padding) {
        base64 += '='.repeat(4 - padding);
      }

      // Безопасное декодирование base64 с поддержкой UTF-8
      let decodedPayload: string;
      try {
        // Используем decodeURIComponent для корректной обработки UTF-8 символов
        const urlSafeBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        decodedPayload = atob(urlSafeBase64);
      } catch (base64Error) {
        console.error('Ошибка декодирования base64:', base64Error);
        // Попробуем альтернативный способ декодирования
        try {
          decodedPayload = atob(base64);
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

      // Проверяем и нормализуем строковые поля для корректной работы с UTF-8
      if (payload.fullName && typeof payload.fullName === 'string') {
        // Убеждаемся, что fullName корректно декодирован
        try {
          // Проверяем, что строка не содержит некорректных символов
          // Используем более точную проверку для UTF-8 символов
          const testString = payload.fullName;
          const isValidUTF8 = /^[\u0000-\u007F\u0080-\uFFFF]*$/.test(testString);
          
          if (!isValidUTF8 || testString.includes('') || testString.includes('')) {
            console.warn('Обнаружены некорректные символы в fullName, очищаем');
            payload.fullName = undefined;
          } else {
            // Нормализуем Unicode символы
            payload.fullName = testString.normalize('NFC');
          }
        } catch (error) {
          console.warn('Ошибка обработки fullName:', error);
          payload.fullName = undefined;
        }
      }

      return payload;
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
      // Очищаем некорректный токен при ошибке
      this.logout();
      return null;
    }
  }

  /**
   * Получение информации о текущем пользователе с сервера
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Проверяем аутентификацию
      if (!this.isAuthenticated()) {
        return null;
      }

      // Получаем данные с сервера
      const response = await apiService.get<User>('/auth/profile');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Если сервер вернул ошибку, очищаем токены
      if (response.error) {
        console.error('Ошибка получения профиля с сервера:', response.error);
        this.logout();
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      // При ошибке сети или сервера очищаем токены
      this.logout();
      return null;
    }
  }

  /**
   * Получение типизированного пользователя с сервера
   */
  async getCurrentUserTyped(): Promise<Client | Master | Admin | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    switch (user.role) {
      case 'client':
        return user as Client;
      case 'nailmaster':
        return user as Master;
      case 'admin':
        return user as Admin;
      default:
        return user as any;
    }
  }

  /**
   * Проверка роли пользователя (синхронная версия для быстрых проверок)
   */
  hasRole(role: string): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload?.role === role;
    } catch (error) {
      console.error('Ошибка проверки роли:', error);
      return false;
    }
  }

  /**
   * Проверка роли пользователя с сервера (асинхронная версия)
   */
  async hasRoleAsync(role: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Проверка, является ли пользователь клиентом (синхронная версия)
   */
  isClient(): boolean {
    return this.hasRole('client');
  }

  /**
   * Проверка, является ли пользователь клиентом (асинхронная версия)
   */
  async isClientAsync(): Promise<boolean> {
    return this.hasRoleAsync('client');
  }

  /**
   * Проверка, является ли пользователь мастером (синхронная версия)
   */
  isMaster(): boolean {
    return this.hasRole('nailmaster');
  }

  /**
   * Проверка, является ли пользователь мастером (асинхронная версия)
   */
  async isMasterAsync(): Promise<boolean> {
    return this.hasRoleAsync('nailmaster');
  }

  /**
   * Проверка, является ли пользователь администратором (синхронная версия)
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Проверка, является ли пользователь администратором (асинхронная версия)
   */
  async isAdminAsync(): Promise<boolean> {
    return this.hasRoleAsync('admin');
  }

  /**
   * Регистрация администратора (требует секретный ключ)
   */
  async registerAdmin(adminData: RegisterRequest & { adminSecret: string }): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register-admin', adminData, false);
    
    if (response.success && response.data) {
      const { token, refreshToken } = response.data;
      apiService.setTokens(token, refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка регистрации администратора');
  }

  /**
   * Получение профиля пользователя с сервера
   */
  async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/auth/profile');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения профиля');
  }
}

export const authService = new AuthService(); 
import { apiService } from './api.service';
import { 
  type LoginRequest, 
  type RegisterRequest, 
  type AuthResponse, 
  type User,
  type ApiResponse 
} from '../types/api.types';

class AuthService {
  /**
   * Авторизация пользователя
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
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
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
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
    const response = await apiService.post<AuthResponse>('/auth/refresh');
    
    if (response.success && response.data) {
      const { token, refreshToken } = response.data;
      apiService.setTokens(token, refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка обновления токена');
  }

  /**
   * Выход из системы
   */
  logout(): void {
    apiService.clearTokens();
  }

  /**
   * Проверка, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return !!apiService.getToken();
  }

  /**
   * Получение текущего токена
   */
  getToken(): string | null {
    return apiService.getToken();
  }

  /**
   * Получение информации о текущем пользователе из токена
   */
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Декодируем JWT токен (простой способ без библиотек)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        email: payload.email,
        username: payload.username || payload.email,
        role: payload.role,
        fullName: payload.fullName,
        phone: payload.phone,
        avatar: payload.avatar,
      };
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
      return null;
    }
  }

  /**
   * Проверка роли пользователя
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Проверка, является ли пользователь клиентом
   */
  isClient(): boolean {
    return this.hasRole('client');
  }

  /**
   * Проверка, является ли пользователь мастером
   */
  isMaster(): boolean {
    return this.hasRole('nailmaster');
  }

  /**
   * Проверка, является ли пользователь администратором
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Регистрация администратора (требует секретный ключ)
   */
  async registerAdmin(adminData: RegisterRequest & { adminSecret: string }): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register-admin', adminData);
    
    if (response.success && response.data) {
      const { token, refreshToken } = response.data;
      apiService.setTokens(token, refreshToken);
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка регистрации администратора');
  }
}

export const authService = new AuthService(); 
import { ApiResponse } from '@/types/api.types';
import { getCallStack } from '@/utils/stack.util';

// API configuration and base service
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Проверка актуальности токена
   */
  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Разбиваем токен на части
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Неверный формат токена');
        return false;
      }

      // Безопасное декодирование base64 с поддержкой URL-безопасных символов
      let base64 = parts[1];
      const padding = base64.length % 4;
      if (padding) {
        base64 += '='.repeat(4 - padding);
      }

      // Заменяем URL-безопасные символы на стандартные base64
      const urlSafeBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
      
      // Декодируем токен для проверки времени истечения
      const payload = JSON.parse(atob(urlSafeBase64));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Ошибка проверки токена:', error);
      return false;
    }
  }

  /**
   * Корневой метод для выполнения запросов с логированием
   * @param endpoint - URL-адрес запроса
   * @param method - метод запроса
   * @param data - данные запроса
   * @returns ответ от сервера
   */
  async makeRequest<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>> {
    // Проверяем актуальность токена перед запросом (кроме auth endpoints)
    if (!endpoint.startsWith('/auth/') && this.getToken() && !this.isTokenValid()) {
      console.warn('Токен истек, очищаем и перенаправляем на вход');
      this.clearTokens();
      window.location.href = '/auth';
      throw new Error('Сессия истекла. Необходимо войти заново.');
    }

    const isFormData = data instanceof FormData;
    const headers = this.getHeaders(true, isFormData);
    let body: BodyInit | undefined = undefined;

    if (method === 'POST' || method === 'PUT') {
      // Для FormData не используем JSON.stringify
      body = isFormData ? data : JSON.stringify(data);
    } else if (method === 'DELETE' || method === 'GET') {
      body = undefined
    }

    // Получаем отформатированный стек вызова
    const callStack = getCallStack(2); // Пропускаем 2 фрейма: Error и makeRequest

    // Логируем запрос с информацией о стеке вызова
    console.group(`API Request to ${method} ${endpoint}`);
    console.log('Method:', method);
    console.log('Headers:', headers);
    if (body) {
      if (isFormData) {
        console.log('Body: FormData with files');
        // Можем показать ключи FormData для отладки
        for (const [key, value] of (body as FormData).entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }
      } else {
        console.log('Body:', JSON.parse(body.toString()));
      }
    }
    console.log('Call Stack:\n', callStack);
    console.groupEnd();

    const fetchData = () => fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body,
    });

    const response = await fetchData();

    // Логируем ответ
    const responseClone = response.clone();
    const responseData = await responseClone.json();

    console.group(`API Response from ${method} ${endpoint}`);
    if (responseData.success) {
      console.log('Status: Success');
      // Проверяем данные на пустой массив или отсутствие данных
      if (!responseData.data) {
        console.log('Data: No data');
      } else if (Array.isArray(responseData.data) && responseData.data.length === 0) {
        console.log('Data: Empty array');
      } else {
        console.log('Data:', responseData.data);
      }
    } else {
      console.error('Status: Error');
      console.error('Error:', responseData.error);
    }
    console.log('Call Stack:\n', callStack);
    console.groupEnd();

    return this.handleResponse<T>(response);
  }

  /**
   * Получение токена доступа
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Получение refresh токена
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Сохранение токенов
   */
  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Очистка токенов
   */
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

  /**
   * Создание заголовков с авторизацией
   */
  private getHeaders(includeAuth: boolean = true, isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    // Для FormData не устанавливаем Content-Type, браузер сам установит multipart/form-data
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Обработка ответа с автоматическим обновлением токена
   */
  private async handleResponse<T>(response: Response, originalRequest?: () => Promise<Response>): Promise<ApiResponse<T>> {
    // Если токен истек (401), пытаемся обновить его
    if (response.status === 401 && originalRequest) {
      try {
        await this.refreshToken();
        // Повторяем оригинальный запрос с новым токеном
        const newResponse = await originalRequest();
        return this.handleResponse<T>(newResponse);
      } catch (refreshError) {
        // Если обновление токена не удалось, очищаем токены
        this.clearTokens();
        // Перенаправляем на страницу входа (можно вызвать колбэк)
        window.location.href = '/auth';
        throw new Error('Сессия истекла. Необходимо войти заново.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Network error',
        success: false,
        error: `HTTP error! status: ${response.status}`
      }));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Обновление токена доступа
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    if (data.success && data.data) {
      this.setTokens(data.data.token, data.data.refreshToken);
    } else {
      throw new Error('Invalid refresh response');
    }
  }

  /**
   * Метод для выполнения GET-запроса
   * @param endpoint - URL-адрес запроса
   * @param includeAuth - флаг, указывающий, нужна ли авторизация
   * @returns ответ от сервера
   */
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'GET');
  }

  /**
   * Метод для выполнения POST-запроса
   * @param endpoint - URL-адрес запроса
   * @param data - данные запроса
   * @param includeAuth - флаг, указывающий, нужна ли авторизация
   * @returns ответ от сервера
   */
  async post<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'POST', data);
  }

  /**
   * Метод для выполнения PUT-запроса
   * @param endpoint - URL-адрес запроса
   * @param data - данные запроса
   * @param includeAuth - флаг, указывающий, нужна ли авторизация
   * @returns ответ от сервера
   */
  async put<T>(endpoint: string, data: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'PUT', data);
  }

  /**
   * Метод для выполнения DELETE-запроса
   * @param endpoint - URL-адрес запроса
   * @param includeAuth - флаг, указывающий, нужна ли авторизация
   * @returns ответ от сервера
   */
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'DELETE');
  }

  /**
   * Загрузка файлов с FormData
   */
  async uploadFile<T>(endpoint: string, formData: FormData, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {};

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }
}

export const apiService = new ApiService();

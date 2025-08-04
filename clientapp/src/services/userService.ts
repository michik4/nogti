import { apiService } from './api';
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '@/types/api.types';
import { User, Client, Master } from '@/types/user.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  type: 'client' | 'master';
  location?: string;
  specialties?: string[];
}

export interface ClientStats {
  totalReviews: number;
  averageRatingGiven: number;
  ratingDistribution: number[];
  recentReviews: Array<{
    id: string;
    ratingNumber: number;
    description: string;
    createdAt: Date;
    masterName: string;
  }>;
}

export const userService = {
  async getPopularMasters(limit: number = 8): Promise<ApiResponse<Master[]>> {
    return apiService.get<Master[]>(`/masters/popular?limit=${limit}`);
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<Client | Master>> {
    const loginRequest: LoginRequest = {
      email: credentials.email,
      password: credentials.password
    };
    return apiService.post<Client | Master>('/auth/login', loginRequest, false);
  },

  async register(data: RegisterData): Promise<ApiResponse<Client | Master>> {
    const registerRequest: RegisterRequest = {
      email: data.email,
      username: data.email,
      password: data.password,
      role: data.type === 'master' ? 'nailmaster' : 'client',
      fullName: data.name,
      phone: data.phone
    };
    return apiService.post<Client | Master>('/auth/register', registerRequest, false);
  },

  async getProfile(userId?: string): Promise<ApiResponse<Client | Master>> {
    const endpoint = userId ? `/users/${userId}` : '/auth/profile';
    return apiService.get<Client | Master>(endpoint);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.put<AuthResponse>(`/auth/profile`, updates);
    
    // Если обновление прошло успешно и получены новые токены, обновляем их
    if (response.success && response.data && response.data.token && response.data.refreshToken) {
      console.log('Получены новые токены после обновления профиля');
      apiService.setTokens(response.data.token, response.data.refreshToken);
    }
    
    return response;
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiService.post<null>('/auth/logout', {});
  },

  async getMasterProfile(masterId: string): Promise<ApiResponse<Master>> {
    return apiService.get<Master>(`/masters/profile/${masterId}`);
  },

  /**
   * Получает статистику отзывов клиента
   */
  getClientStats: async (): Promise<ClientStats> => {
    try {
      const res = await apiService.get<ClientStats>('/auth/client/stats', true);
      return res.data;
    } catch (error) {
      console.error('Ошибка при получении статистики клиента:', error);
      throw error;
    }
  },

  /**
   * Обновляет аватар пользователя
   */
  updateAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    try {
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF');
      }

      // Проверяем размер файла (максимум 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await apiService.put<{ avatar_url: string }>('/auth/avatar', formData, true);
      return res.data;
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      throw error;
    }
  }
};

import { apiService } from './api.service';
import { 
  type Master, 
  type NailDesign,
  type UpdateMasterProfileRequest,
  type NearbyMastersParams,
  type ApiResponse
} from '../types/api.types';

class MastersService {
  /**
   * Добавление дизайна в список "Я так могу"
   */
  async addCanDoDesign(designId: string): Promise<void> {
    const response = await apiService.post<void>(`/masters/can-do/${designId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Ошибка добавления дизайна');
    }
  }

  /**
   * Удаление дизайна из списка "Я так могу"
   */
  async removeCanDoDesign(designId: string): Promise<void> {
    const response = await apiService.delete<void>(`/masters/can-do/${designId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Ошибка удаления дизайна');
    }
  }

  /**
   * Получение дизайнов мастера (список "Я так могу")
   */
  async getMasterDesigns(): Promise<NailDesign[]> {
    const response = await apiService.get<NailDesign[]>('/masters/my-designs');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения дизайнов мастера');
  }

  /**
   * Обновление информации о дизайне в списке мастера
   */
  async updateMasterDesign(designId: string, data: { price?: number; notes?: string }): Promise<void> {
    const response = await apiService.put<void>(`/masters/can-do/${designId}`, data);
    
    if (!response.success) {
      throw new Error(response.error || 'Ошибка обновления информации о дизайне');
    }
  }

  /**
   * Получение профиля мастера по ID
   */
  async getMasterProfile(masterId?: string): Promise<Master> {
    const url = masterId ? `/masters/profile/${masterId}` : '/masters/profile';
    const response = await apiService.get<Master>(url);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Профиль мастера не найден');
  }

  /**
   * Обновление профиля мастера
   */
  async updateMasterProfile(profileData: UpdateMasterProfileRequest): Promise<Master> {
    const response = await apiService.put<Master>('/masters/profile', profileData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка обновления профиля');
  }

  /**
   * Поиск ближайших мастеров
   */
  async findNearbyMasters(params: NearbyMastersParams): Promise<Master[]> {
    const response = await apiService.get<Master[]>('/masters/nearby', params);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка поиска мастеров');
  }

  /**
   * Получение всех мастеров с фильтрацией
   */
  async getMasters(params: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    location?: { lat: number; lng: number; radius: number };
  } = {}): Promise<{ data: Master[]; pagination: any }> {
    const response = await apiService.get<Master[]>('/masters', params);
    
    if (response.success) {
      return response as any;
    }
    
    throw new Error(response.error || 'Ошибка получения мастеров');
  }

  /**
   * Получение расписания мастера
   */
  async getMasterSchedule(masterId: string, date?: string): Promise<{
    availableSlots: string[];
    bookedSlots: string[];
  }> {
    const params = date ? { date } : {};
    const response = await apiService.get<{
      availableSlots: string[];
      bookedSlots: string[];
    }>(`/masters/${masterId}/schedule`, params);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения расписания');
  }

  /**
   * Обновление рабочих часов мастера
   */
  async updateWorkingHours(workingHours: any): Promise<void> {
    const response = await apiService.put<void>('/masters/working-hours', { workingHours });
    
    if (!response.success) {
      throw new Error(response.error || 'Ошибка обновления рабочих часов');
    }
  }

  /**
   * Загрузка фото в портфолио мастера
   */
  async uploadPortfolioImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiService.uploadFile<{ url: string }>('/masters/upload-portfolio', file, onProgress);
    
    if (response.success && response.data) {
      return response.data.url;
    }
    
    throw new Error(response.error || 'Ошибка загрузки изображения');
  }

  /**
   * Получение статистики мастера
   */
  async getMasterStats(): Promise<{
    totalOrders: number;
    completedOrders: number;
    rating: number;
    reviewsCount: number;
    earnings: number;
  }> {
    const response = await apiService.get<{
      totalOrders: number;
      completedOrders: number;
      rating: number;
      reviewsCount: number;
      earnings: number;
    }>('/masters/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения статистики');
  }
}

export const mastersService = new MastersService(); 
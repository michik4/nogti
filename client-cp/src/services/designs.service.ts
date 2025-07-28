import { apiService } from './api.service';
import { 
  type NailDesign, 
  type DesignSearchParams, 
  type CreateDesignRequest,
  type PaginatedResponse,
  type ApiResponse,
  type Master
} from '../types/api.types';

class DesignsService {
  /**
   * Получение списка дизайнов с фильтрами и пагинацией
   */
  async getDesigns(params: DesignSearchParams = {}): Promise<PaginatedResponse<NailDesign>> {
    const response = await apiService.get<NailDesign[]>('/designs', params);
    
    if (response.success) {
      return response as PaginatedResponse<NailDesign>;
    }
    
    throw new Error(response.error || 'Ошибка получения дизайнов');
  }

  /**
   * Получение дизайна по ID
   */
  async getDesignById(id: string): Promise<NailDesign> {
    const response = await apiService.get<NailDesign>(`/designs/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Дизайн не найден');
  }

  /**
   * Создание нового дизайна
   */
  async createDesign(designData: CreateDesignRequest): Promise<NailDesign> {
    const response = await apiService.post<NailDesign>('/designs', designData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка создания дизайна');
  }

  /**
   * Лайк/анлайк дизайна
   */
  async toggleLike(designId: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await apiService.post<{ liked: boolean; likesCount: number }>(`/designs/${designId}/like`, {});
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка при обработке лайка');
  }

  /**
   * Получение мастеров, которые могут выполнить дизайн
   */
  async getMastersForDesign(designId: string): Promise<Master[]> {
    const response = await apiService.get<Master[]>(`/designs/${designId}/masters`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения мастеров');
  }

  /**
   * Получение популярных дизайнов
   */
  async getPopularDesigns(limit: number = 10): Promise<NailDesign[]> {
    const response = await this.getDesigns({ 
      limit
    });
    
    return response.data;
  }

  /**
   * Получение дизайнов по типу
   */
  async getDesignsByType(type: 'basic' | 'designer', params: Omit<DesignSearchParams, 'type'> = {}): Promise<PaginatedResponse<NailDesign>> {
    return this.getDesigns({ ...params, type });
  }

  /**
   * Получение дизайнов по тегам
   */
  async getDesignsByTags(tags: string, params: Omit<DesignSearchParams, 'tags'> = {}): Promise<PaginatedResponse<NailDesign>> {
    return this.getDesigns({ ...params, tags });
  }

  /**
   * Загрузка изображения для дизайна
   */
  async uploadDesignImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiService.uploadFile<{ url: string }>('/designs/upload-image', file, onProgress);
    
    if (response.success && response.data) {
      return response.data.url;
    }
    
    throw new Error(response.error || 'Ошибка загрузки изображения');
  }

  /**
   * Получение всех дизайнов для админа (включая немодерированные)
   */
  async getAllDesignsForAdmin(params: DesignSearchParams & {
    isModerated?: boolean;
    isActive?: boolean;
  } = {}): Promise<PaginatedResponse<NailDesign>> {
    const response = await apiService.get<NailDesign[]>('/designs/admin/all', params);
    
    if (response.success) {
      return response as PaginatedResponse<NailDesign>;
    }
    
    throw new Error(response.error || 'Ошибка получения дизайнов для админа');
  }

  /**
   * Модерация дизайна (одобрение/отклонение)
   */
  async moderateDesign(designId: string, isModerated: boolean, isActive: boolean = true): Promise<NailDesign> {
    const response = await apiService.put<NailDesign>(`/designs/${designId}/moderate`, {
      isModerated,
      isActive
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка модерации дизайна');
  }
}

export const designsService = new DesignsService(); 
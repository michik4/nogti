import { apiService } from './api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Design, NailDesignType } from '@/types/design.types';

export interface CreateDesignData {
  title: string;
  category: string;
  price: string;
  duration: string;
  image: string;
  masterId: string;
}

export interface NailDesign {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  type: 'basic' | 'designer';
  source: 'admin' | 'client' | 'master';
  tags?: string[];
  color?: string;
  minPrice?: number; // Минимальная цена от связанных услуг
  likesCount: number;
  ordersCount: number;
  isActive: boolean;
  isModerated: boolean;
  isLiked?: boolean; // Добавляем поле для отображения статуса лайка
  createdAt: string;
  updatedAt: string;
}

export interface GetDesignsParams {
  page?: number;
  limit?: number;
  type?: 'basic' | 'designer';
  source?: 'admin' | 'client' | 'master';
  color?: string;
  tags?: string;
  includeOwn?: boolean;
}

export interface LikeResponse {
  isLiked: boolean;
  likesCount: number;
}

export const designService = {
  async getDesigns(masterId?: string): Promise<ApiResponse<Design[]>> {
    const endpoint = masterId ? `/designs?masterId=${masterId}` : '/designs';
    return apiService.get<Design[]>(endpoint);
  },

  async getAllDesigns(params?: GetDesignsParams): Promise<PaginatedResponse<NailDesign>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.color) queryParams.append('color', params.color);
    if (params?.tags) queryParams.append('tags', params.tags);
    if (params?.includeOwn) queryParams.append('includeOwn', 'true');

    const endpoint = `/designs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any>(endpoint) as Promise<PaginatedResponse<NailDesign>>;
  },

  async searchDesigns(query: string, params?: GetDesignsParams): Promise<PaginatedResponse<NailDesign>> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.color) queryParams.append('color', params.color);
    if (params?.tags) queryParams.append('tags', params.tags);
    if (params?.includeOwn) queryParams.append('includeOwn', 'true');

    return apiService.get<any>(`/designs/search?${queryParams.toString()}`) as Promise<PaginatedResponse<NailDesign>>;
  },

  async createDesign(data: CreateDesignData): Promise<ApiResponse<Design>> {
    return apiService.post<Design>('/designs', data);
  },

  async createNailDesign(data: {
    title: string;
    description?: string;
    imageUrl: string;
    videoUrl?: string;
    type: 'basic' | 'designer';
    tags: string[];
    color?: string;
  }): Promise<ApiResponse<NailDesign>> {
    return apiService.post<NailDesign>('/designs', data);
  },

  async updateDesign(designId: string, updates: Partial<Design>): Promise<ApiResponse<Design>> {
    return apiService.put<Design>(`/designs/${designId}`, updates);
  },

  async deleteDesign(designId: string): Promise<ApiResponse<null>> {
    return apiService.delete<null>(`/designs/${designId}`);
  },

  async toggleDesignStatus(designId: string): Promise<ApiResponse<Design>> {
    return apiService.put<Design>(`/designs/${designId}/toggle`, {});
  },

  async getPopularDesigns(limit: number = 8): Promise<ApiResponse<NailDesignType[]>> {
    return apiService.get<NailDesignType[]>(`/designs/popular?limit=${limit}`);
  },

  getMasterDesigns: async (masterId: string): Promise<ApiResponse<NailDesign[]>> => {
    return apiService.get(`/designs/master/${masterId}`);
  },

  getDesignById: async (id: string): Promise<ApiResponse<NailDesign>> => {
    return apiService.get(`/designs/${id}`);
  },

  updateNailDesign: async (id: string, updates: Partial<NailDesign>): Promise<ApiResponse<NailDesign>> => {
    return apiService.put(`/designs/${id}`, updates);
  },

  deleteNailDesign: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete(`/designs/${id}`);
  },

  getMastersForDesign: async (designId: string): Promise<ApiResponse<any[]>> => {
    return apiService.get(`/designs/${designId}/masters`);
  },

  // Новые функции для лайков
  likeDesign: async (designId: string): Promise<ApiResponse<LikeResponse>> => {
    return apiService.post(`/designs/${designId}/like`, {});
  },

  unlikeDesign: async (designId: string): Promise<ApiResponse<LikeResponse>> => {
    return apiService.delete(`/designs/${designId}/like`);
  },

  toggleLike: async (designId: string): Promise<ApiResponse<LikeResponse>> => {
    return apiService.post(`/designs/${designId}/like`, {});
  },

  getUserLikedDesigns: async (params?: GetDesignsParams): Promise<PaginatedResponse<NailDesign>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.color) queryParams.append('color', params.color);
    if (params?.tags) queryParams.append('tags', params.tags);

    const endpoint = `/designs/liked${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any>(endpoint) as Promise<PaginatedResponse<NailDesign>>;
  },

  checkIsLiked: async (designId: string): Promise<ApiResponse<{ isLiked: boolean }>> => {
    return apiService.get(`/designs/${designId}/like-status`);
  },

  // Загрузка изображения для дизайна
  uploadDesignImage: async (file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);

    // Валидация файла на клиенте
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Файл слишком большой. Максимальный размер: 10MB');
    }

    return apiService.uploadFile<{ imageUrl: string }>('/designs/upload-image', formData);
  }
};

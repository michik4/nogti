import { apiService as api} from './api';
import { ApiResponse } from '@/types/api.types';

export interface MasterStats {
  id: string;
  fullName: string;
  rating?: number;
  reviewsCount?: number;
  totalOrders?: number;
  completedOrders?: number;
  pendingOrders?: number;
  averageOrderPrice?: number;
  totalEarnings?: number;
  experienceYears?: number;
  specializations?: string[];
  responseTime?: string;
  completionRate?: number;
}

export interface MasterStatsResponse {
  success: boolean;
  data?: MasterStats;
  error?: string;
}

class MasterStatsService {
  /**
   * Получить статистику мастера
   */
  async getMasterStats(masterId: string): Promise<MasterStats> {
    try {
      const response = await api.get<MasterStats>(`/masters/stats`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Не удалось получить статистику мастера');
      }
    } catch (error) {
      console.error('Ошибка получения статистики мастера:', error);
      throw error;
    }
  }

  /**
   * Получить расширенную статистику мастера с дополнительными метриками
   */
  async getExtendedMasterStats(masterId: string): Promise<MasterStats> {
    try {
      const response = await api.get<MasterStats>(`/masters/stats/extended`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Не удалось получить расширенную статистику мастера');
      }
    } catch (error) {
      console.error('Ошибка получения расширенной статистики мастера:', error);
      throw error;
    }
  }

  /**
   * Получить статистику заказов мастера
   */
  async getMasterOrdersStats(masterId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderPrice: number;
    totalEarnings: number;
  }> {
    try {
      const response = await api.get<{
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        averageOrderPrice: number;
        totalEarnings: number;
      }>(`/masters/${masterId}/orders/stats`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Не удалось получить статистику заказов');
      }
    } catch (error) {
      console.error('Ошибка получения статистики заказов:', error);
      throw error;
    }
  }

  /**
   * Получить статистику рейтингов мастера
   */
  async getMasterRatingStats(masterId: string): Promise<{
    rating: number;
    reviewsCount: number;
    ratingDistribution: number[];
  }> {
    try {
      const response = await api.get<{
        rating: number;
        reviewsCount: number;
        ratingDistribution: number[];
      }>(`/masters/${masterId}/rating/stats`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Не удалось получить статистику рейтингов');
      }
    } catch (error) {
      console.error('Ошибка получения статистики рейтингов:', error);
      throw error;
    }
  }
}

export const masterStatsService = new MasterStatsService(); 
import { apiService } from './api';
import { ApiResponse } from '@/types/api.types';
import {
  AdminStats,
  UserListParams,
  OrderListParams,
  DesignListParams,
  UserListResponse,
  OrderListResponse,
  DesignListResponse,
  DesignModerationParams
} from '@/types/admin.types';
import { User } from '@/types/user.types';

export const adminService = {
  // Получение общей статистики
  async getStats(): Promise<ApiResponse<AdminStats>> {
    return apiService.get<AdminStats>('/admin/stats');
  },

  // Получение списка пользователей с фильтрацией
  async getUsers(params: UserListParams): Promise<ApiResponse<UserListResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);

    return apiService.get<UserListResponse>(`/admin/users?${queryParams.toString()}`);
  },

  // Получение списка заказов с фильтрацией
  async getOrders(params: OrderListParams): Promise<ApiResponse<OrderListResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);

    return apiService.get<OrderListResponse>(`/admin/orders?${queryParams.toString()}`);
  },

  // Получение списка дизайнов с фильтрацией
  async getDesigns(params: DesignListParams): Promise<ApiResponse<DesignListResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.source) queryParams.append('source', params.source);
    if (typeof params.isModerated === 'boolean') queryParams.append('isModerated', params.isModerated.toString());
    if (typeof params.isActive === 'boolean') queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);

    return apiService.get<DesignListResponse>(`/admin/designs?${queryParams.toString()}`);
  },

  // Блокировка/разблокировка пользователя
  async toggleUserBlock(userId: string, blocked: boolean): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/admin/users/${userId}/block`, { blocked });
  },

  // Удаление дизайна
  async deleteDesign(designId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/admin/designs/${designId}`);
  },

  // Модерация дизайна
  async moderateDesign(designId: string, approved: boolean, reason?: string): Promise<ApiResponse<void>> {
    const params: DesignModerationParams = {
      designId,
      approved,
      reason
    };
    return apiService.put<void>(`/admin/designs/${designId}/moderate`, params);
  }
}; 
import { apiService } from './api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Order, OrderStatus, CreateOrderData } from '@/types/booking.types';

export const orderService = {
  /**
   * Получить заказы пользователя
   */
  async getUserOrders(page: number = 1, limit: number = 20, status?: OrderStatus): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiService.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    console.log('Raw API response in orderService:', response);
    return response;
  },

  /**
   * Получить заказ по ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.get<Order>(`/orders/${orderId}`);
    return response.data as Order;
  },

  /**
   * Создать новый заказ
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await apiService.post<Order>('/orders', data);
    return response.data as Order;
  },

  /**
   * Подтвердить заказ (для мастера)
   */
  async confirmOrder(orderId: string, price?: number, masterNotes?: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/confirm`, { price, masterNotes });
    return response.data as Order;
  },

  /**
   * Предложить альтернативное время (для мастера)
   */
  async proposeAlternativeTime(orderId: string, proposedDateTime: string, masterNotes?: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/propose-time`, { proposedDateTime, masterNotes });
    return response.data as Order;
  },

  /**
   * Отклонить заказ (для мастера)
   */
  async declineOrder(orderId: string, masterNotes?: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/decline`, { masterNotes });
    return response.data as Order;
  },

  /**
   * Принять предложенное время (для клиента)
   */
  async acceptProposedTime(orderId: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/accept-proposed-time`, {});
    return response.data as Order;
  },

  /**
   * Отменить заказ (для клиента)
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/cancel`, {});
    return response.data as Order;
  },

  /**
   * Завершить заказ (для мастера)
   */
  async completeOrder(orderId: string, masterNotes?: string, rating?: number): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/complete`, { masterNotes, rating });
    return response.data as Order;
  },

  /**
   * Поиск заказов
   */
  async searchOrders(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await apiService.get<PaginatedResponse<Order>>(`/orders/search?${params.toString()}`);
    return response.data as PaginatedResponse<Order>;
  }
}; 
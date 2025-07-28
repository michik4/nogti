import { apiService } from './api.service';
import { 
  type Order, 
  type CreateOrderRequest,
  type ProposeTimeRequest,
  type ApiResponse
} from '../types/api.types';

class OrdersService {
  /**
   * Создание нового заказа
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await apiService.post<Order>('/orders', orderData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка создания заказа');
  }

  /**
   * Получение заказов пользователя
   */
  async getUserOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    role?: 'client' | 'master';
  } = {}): Promise<{ data: Order[]; pagination: any }> {
    const response = await apiService.get<Order[]>('/orders', params);
    
    if (response.success) {
      return response as any;
    }
    
    throw new Error(response.error || 'Ошибка получения заказов');
  }

  /**
   * Получение заказа по ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.get<Order>(`/orders/${orderId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Заказ не найден');
  }

  /**
   * Подтверждение заказа мастером
   */
  async confirmOrder(orderId: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/confirm`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка подтверждения заказа');
  }

  /**
   * Предложение альтернативного времени мастером
   */
  async proposeAlternativeTime(orderId: string, proposedTime: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/propose-time`, { 
      proposedTime 
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка предложения времени');
  }

  /**
   * Отклонение заказа мастером
   */
  async declineOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/decline`, { 
      reason 
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка отклонения заказа');
  }

  /**
   * Принятие предложенного времени клиентом
   */
  async acceptProposedTime(orderId: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/accept-proposed-time`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка принятия предложенного времени');
  }

  /**
   * Отмена заказа клиентом
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/cancel`, { 
      reason 
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка отмены заказа');
  }

  /**
   * Завершение заказа
   */
  async completeOrder(orderId: string): Promise<Order> {
    const response = await apiService.put<Order>(`/orders/${orderId}/complete`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка завершения заказа');
  }

  /**
   * Получение активных заказов для мастера
   */
  async getActiveOrdersForMaster(): Promise<Order[]> {
    const response = await apiService.get<Order[]>('/orders', { 
      status: 'pending,confirmed,time_proposed',
      role: 'master' 
    });
    
    if (response.success) {
      return (response as any).data;
    }
    
    throw new Error(response.error || 'Ошибка получения активных заказов');
  }

  /**
   * Получение истории заказов для клиента
   */
  async getOrderHistoryForClient(): Promise<Order[]> {
    const response = await apiService.get<Order[]>('/orders', { 
      status: 'completed,cancelled,declined',
      role: 'client' 
    });
    
    if (response.success) {
      return (response as any).data;
    }
    
    throw new Error(response.error || 'Ошибка получения истории заказов');
  }

  /**
   * Поиск доступных временных слотов для записи
   */
  async getAvailableTimeSlots(masterId: string, date: string): Promise<string[]> {
    const response = await apiService.get<string[]>(`/orders/available-slots`, {
      masterId,
      date
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения доступных слотов');
  }

  /**
   * Получение статистики заказов
   */
  async getOrdersStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    const response = await apiService.get<{
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    }>('/orders/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Ошибка получения статистики заказов');
  }
}

export const ordersService = new OrdersService(); 
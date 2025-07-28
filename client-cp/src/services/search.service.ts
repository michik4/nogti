import { apiService } from './api.service';
import type { SearchItem } from '../components/UuidSearch';
import type { NailDesign, Order, Master } from '../types/api.types';

type DesignType = 'basic' | 'designer';

interface SearchDesignsParams {
  query: string;
  limit?: number;
  type?: DesignType;
}

interface SearchMastersParams {
  query: string;
  limit?: number;
}

interface SearchOrdersParams {
  query: string;
  limit?: number;
}

class SearchService {
  /**
   * Поиск дизайнов по названию или описанию
   */
  async searchDesigns(params: SearchDesignsParams): Promise<SearchItem[]> {
    const response = await apiService.get<{ designs: NailDesign[] }>('/designs/search', params);
    
    if (response.success && response.data?.designs) {
      return response.data.designs.map(design => ({
        id: design.id,
        title: design.title,
        subtitle: design.description,
        imageUrl: design.imageUrl
      }));
    }
    
    return [];
  }

  /**
   * Поиск мастеров по имени или адресу
   */
  async searchMasters(params: SearchMastersParams): Promise<SearchItem[]> {
    const response = await apiService.get<{ masters: Master[] }>('/masters/search', params);
    
    if (response.success && response.data?.masters) {
      return response.data.masters.map(master => ({
        id: master.id,
        title: master.fullName || '',
        subtitle: master.address,
        imageUrl: master.avatar
      }));
    }
    
    return [];
  }

  /**
   * Поиск заказов по ID или данным клиента/мастера
   */
  async searchOrders(params: SearchOrdersParams): Promise<SearchItem[]> {
    const response = await apiService.get<{ orders: Order[] }>('/orders/search', params);
    
    if (response.success && response.data?.orders) {
      return response.data.orders.map(order => {
        const date = new Date(order.appointmentTime).toLocaleDateString();
        const time = new Date(order.appointmentTime).toLocaleTimeString();
        
        return {
          id: order.id,
          title: `Заказ #${order.id.substring(0, 8)}`,
          subtitle: `${date} ${time} - ${order.status}`,
        };
      });
    }
    
    return [];
  }
}

export const searchService = new SearchService(); 
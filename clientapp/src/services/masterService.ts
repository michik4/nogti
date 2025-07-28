import { apiService as api } from './api';
import { MasterProfile, Master } from '@/types/user.types';
import { MasterService, MasterServiceDesign, MasterStats } from '@/types/master.types';
import { ApiResponse } from '@/types/api.types';

export const masterService = {
  // Получение всех мастеров
  getAllMasters: async (): Promise<ApiResponse<Master[]>> => {
    const response = await api.get<Master[]>('/masters');
    return response;
  },

  // Получение профиля мастера
  getMasterProfile: async (masterId?: string): Promise<MasterProfile> => {
    const endpoint = masterId ? `/masters/profile/${masterId}` : '/masters/profile';
    const response = await api.get<MasterProfile>(endpoint);
    return response.data as MasterProfile;
  },

  // Обновление профиля мастера
  updateMasterProfile: async (data: Partial<Master>): Promise<MasterProfile> => {
    const response = await api.put<MasterProfile>('/masters/profile', data);
    return response.data as MasterProfile;
  },

  // Получение статистики мастера
  getMasterStats: async (): Promise<MasterStats | null> => {
    try {
      const response = await api.get<MasterStats>('/masters/stats');
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения статистики мастера:', error);
      return null;
    }
  },

  // Получение услуг мастера
  getMasterServices: async (masterId: string): Promise<MasterService[]> => {
    console.log('Fetching services for master:', masterId);
    const response = await api.get<MasterService[]>(`/masters/${masterId}/services`);
    console.log('Services response:', response.data);
    
    if (!response.data) {
      console.warn('Invalid services response:', response);
      return [];
    }
    
    if (!Array.isArray(response.data)) {
      console.warn('Services data is not an array:', response.data);
      return [];
    }

    // Преобразуем цены из строк в числа для единообразия в UI
    return response.data.map(service => ({
      ...service,
      price: typeof service.price === 'string' ? parseFloat(service.price) : service.price
    }));
  },

  // Добавление новой услуги
  addMasterService: async (masterId: string, serviceData: Partial<MasterService>): Promise<MasterService> => {
    console.log('Adding service for master:', masterId, 'with data:', serviceData);
    
    try {
      const response = await api.post<MasterService>(`/masters/${masterId}/services`, serviceData);
      
      console.log('Add service response:', response);
      
      if (!response) {
        throw new Error('Сервер вернул пустой ответ');
      }
      
      if (!response.success) {
        throw new Error(response.error || 'Ошибка создания услуги');
      }
      
      if (!response.data) {
        throw new Error('Сервер не вернул данные созданной услуги');
      }
      
      const newService = response.data;
      
      if (!newService.id) {
        throw new Error('Созданная услуга не имеет ID');
      }
      
      // Преобразуем цену из строки в число для единообразия в UI
      return {
        ...newService,
        price: typeof newService.price === 'string' ? parseFloat(newService.price) : newService.price
      };
    } catch (error) {
      console.error('Error in addMasterService:', error);
      throw error;
    }
  },

  // Обновление услуги
  updateMasterService: async (serviceId: string, serviceData: Partial<MasterService>): Promise<MasterService> => {
    const response = await api.put<MasterService>(`/masters/services/${serviceId}`, serviceData);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Ошибка обновления услуги');
    }
    
    return {
      ...response.data,
      price: typeof response.data.price === 'string' ? parseFloat(response.data.price) : response.data.price
    };
  },

  // Удаление услуги
  deleteMasterService: async (serviceId: string): Promise<void> => {
    const response = await api.delete<null>(`/masters/services/${serviceId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Ошибка удаления услуги');
    }
  },

  // Получение дизайнов мастера
  getMasterDesigns: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/masters/my-designs');
    return response.data as any[];
  },

  // Добавление дизайна в "Я так могу"
  addCanDoDesign: async (designId: string, data: any): Promise<any> => {
    const response = await api.post<any>(`/masters/can-do/${designId}`, data);
    return response.data;
  },

  // Удаление дизайна из "Я так могу"
  removeCanDoDesign: async (designId: string): Promise<void> => {
    await api.delete<void>(`/masters/can-do/${designId}`);
  },

  // Обновление информации о дизайне
  updateMasterDesign: async (designId: string, data: any): Promise<any> => {
    const response = await api.put<any>(`/masters/can-do/${designId}`, data);
    return response.data;
  },

  /**
   * Получить дизайны для конкретной услуги мастера
   */
  async getServiceDesigns(serviceId: string): Promise<MasterServiceDesign[]> {
    console.log('Запрашиваем дизайны для услуги:', serviceId);
    const response = await api.get<MasterServiceDesign[]>(`/masters/services/${serviceId}/designs`);
    console.log('Ответ от сервера (дизайны услуги):', response.data);
    
    // Проверяем, что response.data существует и является массивом
    if (Array.isArray(response.data)) {
      // Преобразуем строковые цены в числа для единообразия в UI
      return response.data.map(design => ({
        ...design,
        customPrice: typeof design.customPrice === 'string' ? parseFloat(design.customPrice) : design.customPrice
      }));
    }
    
    console.warn('Неожиданный формат ответа для дизайнов услуги:', response);
    return [];
  },

  /**
   * Добавить дизайн к услуге (для мастеров)
   */
  async addDesignToService(
    serviceId: string, 
    designId: string, 
    data: {
      customPrice?: number;
      additionalDuration?: number;
      notes?: string;
    }
  ): Promise<MasterServiceDesign> {
    console.log('Добавляем дизайн к услуге:', { serviceId, designId, data });
    const response = await api.post<MasterServiceDesign>(`/masters/services/${serviceId}/designs/${designId}`, data);
    
    console.log('Ответ от сервера (добавление дизайна к услуге):', response);
    
    if (!response || !response.success) {
      throw new Error(response?.error || 'Ошибка добавления дизайна к услуге');
    }
    
    if (!response.data) {
      throw new Error('Сервер вернул пустой ответ при добавлении дизайна к услуге');
    }
    
    return response.data;
  },

  /**
   * Удалить дизайн из услуги (для мастеров)
   */
  async removeDesignFromService(serviceId: string, designId: string): Promise<void> {
    await api.delete(`/masters/services/${serviceId}/designs/${designId}`);
  },

  /**
   * Обновить информацию о дизайне в услуге (для мастеров)
   */
  async updateServiceDesign(
    serviceId: string, 
    designId: string, 
    data: {
      customPrice?: number;
      additionalDuration?: number;
      notes?: string;
      isActive?: boolean;
    }
  ): Promise<MasterServiceDesign> {
    const response = await api.put<MasterServiceDesign>(`/masters/services/${serviceId}/designs/${designId}`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Ошибка обновления дизайна');
    }
    
    return response.data;
  }
}; 
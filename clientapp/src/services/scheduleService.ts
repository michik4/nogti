import { apiService as api } from './api';
import { ApiResponse } from '@/types/api.types';
import { TimeSlot, ScheduleDay, CreateTimeSlotData, UpdateTimeSlotData } from '@/types/schedule.types';

interface ScheduleServiceInterface {
  getMasterSchedule(masterId: string, startDate?: string, endDate?: string): Promise<ScheduleDay[]>;
  getMySchedule(startDate?: string, endDate?: string): Promise<ScheduleDay[]>;
  addTimeSlot(masterId: string, slotData: CreateTimeSlotData): Promise<TimeSlot>;
  addMyTimeSlot(slotData: CreateTimeSlotData): Promise<TimeSlot>;
  updateTimeSlot(masterId: string, slotId: string, updates: UpdateTimeSlotData): Promise<TimeSlot>;
  updateMyTimeSlot(slotId: string, updates: UpdateTimeSlotData): Promise<TimeSlot>;
  deleteTimeSlot(masterId: string, slotId: string): Promise<void>;
  deleteMyTimeSlot(slotId: string): Promise<void>;
  getAvailableSlots(masterId: string, date: string): Promise<TimeSlot[]>;
  blockTimeSlot(masterId: string, slotId: string): Promise<TimeSlot>;
  unblockTimeSlot(masterId: string, slotId: string): Promise<TimeSlot>;
}

class ScheduleService implements ScheduleServiceInterface {
  async getMasterSchedule(masterId: string, startDate?: string, endDate?: string): Promise<ScheduleDay[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response: ApiResponse<ScheduleDay[]> = await api.get(`/masters/${masterId}/schedule?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения расписания мастера:', error);
      throw error;
    }
  }

  async getMySchedule(startDate?: string, endDate?: string): Promise<ScheduleDay[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response: ApiResponse<ScheduleDay[]> = await api.get(`/masters/schedule?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения расписания:', error);
      throw error;
    }
  }

  async addTimeSlot(masterId: string, slotData: CreateTimeSlotData): Promise<TimeSlot> {
    try {
      const response: ApiResponse<TimeSlot> = await api.post(`/masters/${masterId}/schedule`, slotData);
      return response.data!;
    } catch (error) {
      console.error('Ошибка добавления временного окна:', error);
      throw error;
    }
  }

  async addMyTimeSlot(slotData: CreateTimeSlotData): Promise<TimeSlot> {
    try {
      const response: ApiResponse<TimeSlot> = await api.post('/masters/schedule', slotData);
      return response.data!;
    } catch (error: any) {
      console.error('Ошибка добавления временного окна:', error);
      
      // Обрабатываем специфические ошибки
      if (error.status === 409) {
        throw new Error('Временное окно пересекается с существующим. Выберите другое время.');
      } else if (error.status === 400) {
        throw new Error('Неверные данные. Проверьте дату и время.');
      } else if (error.status === 404) {
        throw new Error('Мастер не найден.');
      } else {
        throw new Error('Не удалось добавить временное окно. Попробуйте позже.');
      }
    }
  }

  async updateTimeSlot(masterId: string, slotId: string, updates: UpdateTimeSlotData): Promise<TimeSlot> {
    try {
      const response: ApiResponse<TimeSlot> = await api.put(`/masters/${masterId}/schedule/${slotId}`, updates);
      return response.data!;
    } catch (error) {
      console.error('Ошибка обновления временного окна:', error);
      throw error;
    }
  }

  async updateMyTimeSlot(slotId: string, updates: UpdateTimeSlotData): Promise<TimeSlot> {
    try {
      const response: ApiResponse<TimeSlot> = await api.put(`/masters/schedule/${slotId}`, updates);
      return response.data!;
    } catch (error) {
      console.error('Ошибка обновления временного окна:', error);
      throw error;
    }
  }

  async deleteTimeSlot(masterId: string, slotId: string): Promise<void> {
    try {
      await api.delete(`/masters/${masterId}/schedule/${slotId}`);
    } catch (error) {
      console.error('Ошибка удаления временного окна:', error);
      throw error;
    }
  }

  async deleteMyTimeSlot(slotId: string): Promise<void> {
    try {
      await api.delete(`/masters/schedule/${slotId}`);
    } catch (error) {
      console.error('Ошибка удаления временного окна:', error);
      throw error;
    }
  }

  async getAvailableSlots(masterId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response: ApiResponse<TimeSlot[]> = await api.get(`/masters/${masterId}/schedule/available?date=${date}`);
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения доступных окон:', error);
      throw error;
    }
  }

  async blockTimeSlot(masterId: string, slotId: string): Promise<TimeSlot> {
    try {
      const response: ApiResponse<TimeSlot> = await api.put(`/masters/${masterId}/schedule/${slotId}/block`, {});
      return response.data!;
    } catch (error) {
      console.error('Ошибка блокировки временного окна:', error);
      throw error;
    }
  }

  async unblockTimeSlot(masterId: string, slotId: string): Promise<TimeSlot> {
    try {
      const response: ApiResponse<TimeSlot> = await api.put(`/masters/${masterId}/schedule/${slotId}/unblock`, {});
      return response.data!;
    } catch (error) {
      console.error('Ошибка разблокировки временного окна:', error);
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService(); 
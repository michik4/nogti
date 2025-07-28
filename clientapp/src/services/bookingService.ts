import { apiService } from './api';
import { ApiResponse } from '@/types/api.types';
import { Booking } from '@/types/booking.types';

export interface CreateBookingData {
  clientId?: string;
  masterId: string;
  designId: string;
  date: string;
  time: string;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
}

export const bookingService = {
  async getBookings(userId: string, userType: 'client' | 'master'): Promise<ApiResponse<Booking[]>> {
    return apiService.get<Booking[]>(`/bookings?userId=${userId}&userType=${userType}`);
  },

  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>('/bookings', data);
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${bookingId}`, updates);
  },

  async cancelBooking(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${bookingId}/cancel`, {});
  },

  async confirmBooking(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${bookingId}/confirm`, {});
  }
};

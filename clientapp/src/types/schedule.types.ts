export interface TimeSlot {
  id: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'blocked';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeSlotData {
  workDate: string;
  startTime: string;
  endTime: string;
  status?: 'available' | 'booked' | 'blocked';
  notes?: string;
}

export interface UpdateTimeSlotData {
  startTime?: string;
  endTime?: string;
  status?: 'available' | 'booked' | 'blocked';
  notes?: string;
}

export interface ScheduleDay {
  date: string;
  timeSlots: TimeSlot[];
}

export interface ScheduleStats {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  blockedSlots: number;
  nextAvailableDate?: string;
} 
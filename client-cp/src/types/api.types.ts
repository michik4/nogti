// Базовые типы ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  error?: string;
  data: T[];
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Типы пользователей
export type UserRole = 'client' | 'nailmaster' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  avatar?: string;
}

// Типы авторизации
export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role: 'client' | 'nailmaster' | 'admin';
  fullName?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Типы дизайнов
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
  estimatedPrice?: number;
  likesCount: number;
  ordersCount: number;
  isActive: boolean;
  isModerated: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignSearchParams {
  page?: number;
  limit?: number;
  type?: 'basic' | 'designer';
  source?: 'admin' | 'client' | 'master';
  color?: string;
  tags?: string;
}

export interface CreateDesignRequest {
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  type?: 'basic' | 'designer';
  tags?: string[];
  color?: string;
  estimatedPrice?: number;
}

// Типы мастеров
export interface Master {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  portfolio: string[];
  canDoDesigns: string[];
  workingHours: WorkingHours;
  avatar?: string;
  description?: string;
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
    isWorking: boolean;
  };
}

export interface UpdateMasterProfileRequest {
  fullName?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  workingHours?: WorkingHours;
  avatar?: string;
  description?: string;
}

export interface NearbyMastersParams {
  designId: string;
  lat: number;
  lng: number;
  radius?: number;
}

// Типы заказов
export interface Order {
  id: string;
  clientId: string;
  masterId: string;
  designId: string;
  status: OrderStatus;
  appointmentTime: string;
  proposedTime?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  design?: NailDesign;
  master?: Master;
  client?: User;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'time_proposed'
  | 'completed'
  | 'cancelled';

export interface CreateOrderRequest {
  masterId: string;
  designId: string;
  appointmentTime: string;
  price: number;
}

export interface ProposeTimeRequest {
  proposedTime: string;
} 
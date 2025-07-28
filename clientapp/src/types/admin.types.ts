import { User } from './user.types';
import { Design } from './design.types';
import { Order } from './booking.types';

export interface AdminStats {
  totalUsers: number;
  totalMasters: number;
  totalClients: number;
  totalBookings: number;
  totalDesigns: number;
  totalUploads: number;
  revenue: number;
  activeBookings: number;
}

export interface UserListResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: PaginationInfo;
}

export interface DesignListResponse {
  designs: Design[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: 'client' | 'nailmaster' | 'admin';
  search?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DesignListParams {
  page?: number;
  limit?: number;
  type?: 'basic' | 'designer';
  source?: 'admin' | 'client' | 'master';
  isModerated?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface DesignModerationParams {
  designId: string;
  approved: boolean;
  reason?: string;
} 
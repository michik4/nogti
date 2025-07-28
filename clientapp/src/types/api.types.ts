export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
  status?: number;
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

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role: 'client' | 'nailmaster';
  fullName?: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    fullName?: string;
    phone?: string;
    isGuest?: boolean;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  isGuest?: boolean;
  username?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  iat?: number;
  exp?: number;
}

export interface AuthError {
  code: 'VALIDATION_ERROR' | 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  field?: string; // Поле, в котором произошла ошибка (для валидации)
  details?: any;
}

export interface AuthFieldError {
  field: 'email' | 'password' | 'username' | 'fullName' | 'phone' | 'general';
  message: string;
} 
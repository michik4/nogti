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
        isGuest?: boolean;
        avatar?: string;
    };
    token: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
    username: string;
    role: string;
    isGuest?: boolean;
    fullName?: string;
    phone?: string;
    avatar?: string;
    iat?: number;
    exp?: number;
} 
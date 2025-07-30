export type UserRole = 'client' | 'nailmaster' | 'admin';
export type UserType = 'client' | 'master' | 'guest';

// Базовый интерфейс пользователя (серверная модель)
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isGuest?: boolean; // Добавляем поле isGuest из серверной модели
  createdAt?: string;
  updatedAt?: string;
}

// Интерфейс клиента - расширяет базовый User
export interface Client extends User {
  role: 'client';
  totalBookings?: number;
  favoriteCount?: number;
  uploadsCount?: number;
  // Статистика отзывов
  reviewsGiven?: number;      // Количество оставленных отзывов
  averageRating?: number;     // Средний рейтинг, который ставит клиент
}

// Интерфейс мастера - расширяет базовый User
export interface Master extends User {
  role: 'nailmaster';
  rating?: number;
  reviewsCount?: number;
  experience?: string;
  specialties?: string[];
  designs?: number;
  uploadsCount?: number;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

// Расширенный интерфейс мастера для UI
export interface MasterProfile extends Master {
  name?: string; // алиас для fullName
  location?: string; // алиас для address
  price?: string;
  image?: string;
  likes?: number;
  isVideo?: boolean;
  videoUrl?: string;
  avatar_url?: string; // алиас для avatar
}

// Интерфейс администратора
export interface Admin extends User {
  role: 'admin';
}

// Интерфейс гостевого пользователя - временный аккаунт
export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: 'guest';
  location?: string;
  joinDate?: string;
  sessionId: string;
  createdAt: string;
  isTemporary: true;
  sessionDuration?: number; // Время жизни сессии в миллисекундах
} 
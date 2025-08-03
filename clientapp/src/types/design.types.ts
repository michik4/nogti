export interface Design {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  price?: string;
  duration?: string;
  likes: number;
  bookings?: number;
  active?: boolean;
  masterName?: string;
} 

// Обновленный интерфейс для соответствия серверной модели
export interface NailDesignType {
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
  // Связи с авторами
  uploadedByClient?: {
    id: string;
    username: string;
  };
  uploadedByAdmin?: {
    id: string;
    username: string;
  };
  uploadedByMaster?: {
    id: string;
    username: string;
  };
}

// Добавляем также алиас для совместимости
export type NailDesign = NailDesignType; 
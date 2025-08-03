export interface MasterService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // в минутах
  isActive: boolean;
  designs?: MasterServiceDesign[]; // Дизайны, привязанные к услуге
  createdAt: string;
  updatedAt: string;
}

export interface MasterServiceDesign {
  id: string;
  customPrice?: number;
  additionalDuration?: number;
  notes?: string;
  isActive: boolean;
  nailDesign: {
    id: string;
    title: string;
    imageUrl: string;
    description?: string;
    type: 'basic' | 'designer';
    tags?: string[];
    isActive: boolean;
    isModerated: boolean;
    likesCount: number;
    ordersCount: number;
    estimatedPrice?: number;
    createdAt?: string;
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
  };
  createdAt: string;
  updatedAt: string;
}

// Новый тип для услуги мастера с информацией о конкретном дизайне
export interface MasterServiceForDesign {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  baseDuration: number;
  customPrice?: number;
  additionalDuration?: number;
  totalPrice: number;
  totalDuration: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Обновленный тип для мастера с его услугами в контексте дизайна
export interface MasterWithServicesForDesign {
  master: {
    id: string;
    name?: string;
    fullName?: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    description?: string;
    address?: string;
    location?: string;
    phone?: string;
    rating: number;
    reviewsCount: number;
    specialties?: string[];
    isActive: boolean;
    latitude?: number;
    longitude?: number;
    totalOrders?: number;
    isModerated?: boolean;
    startingPrice?: number;
  };
  services: MasterServiceForDesign[];
}

export interface MasterProfile {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  description?: string;
  address?: string;
  location?: string;
  phone?: string;
  rating: number;
  reviewsCount: number;
  specialties?: string[];
  price?: string;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// Обновленный интерфейс для создания заказа
export interface CreateOrderRequest {
  masterServiceId: string; // Обязательная услуга
  nailDesignId?: string; // Опциональный дизайн
  nailMasterId: string;
  requestedDateTime: string;
  description?: string;
  clientNotes?: string;
}

export interface MasterStats {
  todayEarnings: number;
  monthlyEarnings: number;
  todayClients: number;
  monthlyClients: number;
  averageRating: number;
  completedBookings: number;
  pendingRequests: number;
  confirmedBookings: number;
  canDoDesignsCount: number;
  servicesCount: number;
  totalOrders: number;
  reviewsCount: number;
}

export interface MasterDesign {
  id: string;
  nailDesign: {
    id: string;
    title: string;
    imageUrl: string;
    description?: string;
    estimatedPrice?: number;
    type: 'basic' | 'designer';
    tags?: string[];
    isActive: boolean;
    isModerated: boolean;
    createdAt?: string;
    likesCount?: number;
    ordersCount?: number;
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
  };
  customPrice?: number;
  notes?: string;
  estimatedDuration?: number;
  isActive: boolean;
  addedAt: string;
} 
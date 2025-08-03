// Статусы заказов (соответствуют серверной модели)
export enum OrderStatus {
  PENDING = 'pending', // Ожидает ответа мастера
  CONFIRMED = 'confirmed', // Подтверждена мастером
  ALTERNATIVE_PROPOSED = 'alternative_proposed', // Мастер предложил другое время
  DECLINED = 'declined', // Отклонена мастером
  TIMEOUT = 'timeout', // Мастер не ответил в течение 5 минут
  COMPLETED = 'completed', // Выполнена
  CANCELLED = 'cancelled' // Отменена
}

// Интерфейс заказа (соответствует серверной модели)
export interface Order {
  id: string;
  description?: string;
  status: OrderStatus;
  price?: number;
  requestedDateTime: string;
  proposedDateTime?: string;
  confirmedDateTime?: string;
  masterNotes?: string;
  clientNotes?: string;
  masterResponseTime?: string;
  completedAt?: string;
  completedBy?: 'master' | 'client' | 'auto';
  rating?: number;
  createdAt: string;
  updatedAt: string;
  
  // Связанные данные
  client: {
    id: string;
    fullName?: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  
  nailMaster: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
    address?: string;
  };
  
  masterService?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
  };
  
  nailDesign?: {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    type: string;
    color?: string;
    likesCount?: number;
    ordersCount?: number;
  };
  
  designSnapshot?: {
    id: string;
    originalDesignId?: string;
    title: string;
    description?: string;
    imageUrl: string;
    type: string;
    color?: string;
    source: string;
    authorName?: string;
    authorId?: string;
  };
}

// Старый интерфейс для обратной совместимости
export interface Booking {
  id: string;
  clientName?: string;
  masterName?: string;
  service: string;
  design: string;
  date: string;
  time?: string;
  price: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  image: string;
  needsResponse?: boolean;
  requestTime?: string;
}

// Интерфейс для создания заказа
export interface CreateOrderData {
  masterServiceId: string;
  nailDesignId?: string;
  nailMasterId: string;
  requestedDateTime: string;
  description?: string;
  clientNotes?: string;
} 
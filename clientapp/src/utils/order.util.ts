import { OrderStatus } from '@/types/booking.types';
import { Order } from "@/types/booking.types";
import { MasterServiceDesign } from "@/types/master.types";

/**
 * Получение цвета для статуса заказа
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return 'text-green-600 bg-green-50 border-green-200';
    case OrderStatus.PENDING:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case OrderStatus.COMPLETED:
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case OrderStatus.CANCELLED:
      return 'text-red-600 bg-red-50 border-red-200';
    case OrderStatus.DECLINED:
      return 'text-red-600 bg-red-50 border-red-200';
    case OrderStatus.ALTERNATIVE_PROPOSED:
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case OrderStatus.TIMEOUT:
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-muted-foreground bg-gray-50 border-gray-200';
  }
};

/**
 * Получение текста для статуса заказа
 */
export const getOrderStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return 'Подтверждена';
    case OrderStatus.PENDING:
      return 'Ожидает подтверждения';
    case OrderStatus.COMPLETED:
      return 'Завершена';
    case OrderStatus.CANCELLED:
      return 'Отменена';
    case OrderStatus.DECLINED:
      return 'Отклонена';
    case OrderStatus.ALTERNATIVE_PROPOSED:
      return 'Предложено новое время';
    case OrderStatus.TIMEOUT:
      return 'Время ответа истекло';
    default:
      return 'Неизвестный статус';
  }
};

/**
 * Получение описания для статуса заказа
 */
export const getOrderStatusDescription = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return 'Мастер подтвердил запись';
    case OrderStatus.PENDING:
      return 'Ожидается ответ мастера';
    case OrderStatus.COMPLETED:
      return 'Услуга выполнена';
    case OrderStatus.CANCELLED:
      return 'Запись отменена';
    case OrderStatus.DECLINED:
      return 'Мастер отклонил запись';
    case OrderStatus.ALTERNATIVE_PROPOSED:
      return 'Мастер предложил другое время';
    case OrderStatus.TIMEOUT:
      return 'Мастер не ответил вовремя';
    default:
      return '';
  }
};

/**
 * Проверка, можно ли отменить заказ
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.ALTERNATIVE_PROPOSED
  ].includes(status);
};

/**
 * Проверка, можно ли принять предложенное время
 */
export const canAcceptProposedTime = (status: OrderStatus): boolean => {
  return status === OrderStatus.ALTERNATIVE_PROPOSED;
};

/**
 * Проверка, можно ли забронировать снова
 */
export const canBookAgain = (status: OrderStatus): boolean => {
  return [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.DECLINED
  ].includes(status);
};

/**
 * Форматирование даты для отображения
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматирование цены
 */
export const formatOrderPrice = (price?: number): string => {
  if (!price) return 'Цена не указана';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(price));
};

/**
 * Проверка, может ли мастер завершить заказ
 */
export const canCompleteOrder = (status: OrderStatus, confirmedDateTime?: string): boolean => {
  if (status !== OrderStatus.CONFIRMED) return false;
  
  if (!confirmedDateTime) return false;
  
  const now = new Date();
  const appointmentTime = new Date(confirmedDateTime);
  
  // Можно завершить только после наступления времени записи
  if (appointmentTime > now) return false;
  
  // И не позже чем через 24 часа после записи
  const maxCompletionTime = new Date(appointmentTime.getTime() + 24 * 60 * 60 * 1000);
  if (now > maxCompletionTime) return false;
  
  return true;
}; 

/**
 * Рассчитывает общую стоимость заказа с учетом дизайна
 */
export const calculateOrderTotalPrice = (order: Order): number => {
  let total = order.price || order.masterService?.price || 0;
  
  // Если есть дизайн с customPrice, добавляем его стоимость
  if (order.nailDesign && order.price && order.masterService?.price) {
    // Вычисляем стоимость дизайна как разность между общей стоимостью и стоимостью услуги
    const designPrice = order.price - order.masterService.price;
    if (designPrice > 0) {
      total = order.price; // Используем уже рассчитанную общую стоимость
    }
  }
  
  return total;
};

/**
 * Рассчитывает стоимость дизайна в заказе
 */
export const calculateOrderDesignPrice = (order: Order): number => {
  if (!order.price || !order.masterService?.price) return 0;
  
  const designPrice = order.price - order.masterService.price;
  return designPrice > 0 ? designPrice : 0;
};

/**
 * Проверяет, есть ли дизайн в заказе
 */
export const hasOrderDesign = (order: Order): boolean => {
  return !!(order.nailDesign || order.designSnapshot);
};

/**
 * Получает информацию о дизайне в заказе
 */
export const getOrderDesignInfo = (order: Order) => {
  if (order.nailDesign) {
    return {
      id: order.nailDesign.id,
      title: order.nailDesign.title,
      description: order.nailDesign.description,
      imageUrl: order.nailDesign.imageUrl,
      type: order.nailDesign.type,
      color: order.nailDesign.color
    };
  }
  
  if (order.designSnapshot) {
    return {
      id: order.designSnapshot.id,
      title: order.designSnapshot.title,
      description: order.designSnapshot.description,
      imageUrl: order.designSnapshot.imageUrl,
      type: order.designSnapshot.type,
      color: order.designSnapshot.color
    };
  }
  
  return null;
}; 
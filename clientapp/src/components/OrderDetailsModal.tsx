import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SmartAvatar } from '@/components/ui/smart-avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  CreditCard,
  User,
  Palette,
  Loader2,
  X
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/booking.types';
import { orderService } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/utils/image.util';
import {
  getOrderStatusColor,
  getOrderStatusText,
  getOrderStatusDescription,
  canCancelOrder,
  canAcceptProposedTime,
  canBookAgain,
  formatOrderDate,
  formatOrderPrice
} from '@/utils/order.util';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onBookAgain?: (designId: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdate,
  onBookAgain
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  if (!order) return null;

  // Отмена заказа
  const handleCancelOrder = async () => {
    try {
      setActionLoading('cancel');
      const updatedOrder = await orderService.cancelOrder(order.id);
      
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }
      
      toast({
        title: "Заказ отменен",
        description: "Ваш заказ был успешно отменен",
      });
      
      onClose();
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить заказ",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Принятие предложенного времени
  const handleAcceptProposedTime = async () => {
    try {
      setActionLoading('accept');
      const updatedOrder = await orderService.acceptProposedTime(order.id);
      
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }
      
      toast({
        title: "Время подтверждено",
        description: "Вы приняли предложенное время",
      });
      
      onClose();
    } catch (error) {
      console.error('Ошибка принятия времени:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось принять предложенное время",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Повторная запись
  const handleBookAgain = () => {
    if (order.nailDesign && onBookAgain) {
      onBookAgain(order.nailDesign.id);
    } else {
      toast({
        title: "Повторная запись",
        description: "Функция повторной записи будет доступна в следующем обновлении",
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Детали заказа</span>
            <Badge 
              variant="outline" 
              className={`${getOrderStatusColor(order.status)} border`}
            >
              {getOrderStatusText(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Услуга и дизайн
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {/* Изображение дизайна или аватар мастера */}
                <div className="flex-shrink-0">
                  {order.nailDesign ? (
                    <img 
                      src={getImageUrl(order.nailDesign.imageUrl) || '/placeholder.svg'} 
                      alt={order.nailDesign.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <SmartAvatar 
                      src={order.nailMaster.avatar} 
                      alt={order.nailMaster.fullName}
                      fallback={order.nailMaster.fullName.charAt(0).toUpperCase()}
                      className="w-20 h-20"
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {order.nailDesign?.title || order.masterService?.name || 'Услуга не указана'}
                  </h3>
                  <p className="text-muted-foreground">
                    {order.nailDesign?.description || order.masterService?.description || 'Описание отсутствует'}
                  </p>
                  {order.nailDesign && (
                    <Badge variant="secondary" className="mt-2">
                      {order.nailDesign.type}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Информация о мастере */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Мастер
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <SmartAvatar 
                  src={order.nailMaster.avatar} 
                  alt={order.nailMaster.fullName}
                  fallback={order.nailMaster.fullName.charAt(0).toUpperCase()}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-semibold">{order.nailMaster.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.nailMaster.email}</p>
                </div>
              </div>
              
              {order.nailMaster.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{order.nailMaster.phone}</span>
                </div>
              )}
              
              {order.nailMaster.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{order.nailMaster.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Время и статус */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Время записи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Запрошенное время</p>
                  <p className="font-semibold">{formatOrderDate(order.requestedDateTime)}</p>
                </div>
                
                {order.proposedDateTime && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Предложенное время</p>
                    <p className="font-semibold">{formatOrderDate(order.proposedDateTime)}</p>
                  </div>
                )}
                
                {order.confirmedDateTime && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Подтвержденное время</p>
                    <p className="font-semibold">{formatOrderDate(order.confirmedDateTime)}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">Статус</p>
                <p className="text-sm text-muted-foreground">{getOrderStatusDescription(order.status)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Цена */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Стоимость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{formatOrderPrice(order.price)}</span>
                <span className="text-sm text-muted-foreground">
                  Длительность: {order.masterService?.duration || 'Не указана'} мин
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Заметки */}
          {(order.clientNotes || order.masterNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Заметки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.clientNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Заметка клиента</p>
                    <p className="text-sm bg-muted p-2 rounded">{order.clientNotes}</p>
                  </div>
                )}
                
                {order.masterNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Заметка мастера</p>
                    <p className="text-sm bg-muted p-2 rounded">{order.masterNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Дополнительная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Дополнительная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Заказ создан</p>
                  <p>{formatOrderDate(order.createdAt)}</p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Последнее обновление</p>
                  <p>{formatOrderDate(order.updatedAt)}</p>
                </div>
                
                {order.masterResponseTime && (
                  <div>
                    <p className="font-medium text-muted-foreground">Ответ мастера</p>
                    <p>{formatOrderDate(order.masterResponseTime)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          {/* Принять предложенное время */}
          {canAcceptProposedTime(order.status) && (
            <Button 
              onClick={handleAcceptProposedTime}
              disabled={actionLoading === 'accept'}
            >
              {actionLoading === 'accept' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Принять время
            </Button>
          )}
          
          {/* Отменить заказ */}
          {canCancelOrder(order.status) && (
            <Button 
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={actionLoading === 'cancel'}
            >
              {actionLoading === 'cancel' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Отменить заказ
            </Button>
          )}
          
          {/* Записаться снова */}
          {canBookAgain(order.status) && (
            <Button 
              variant="outline"
              onClick={handleBookAgain}
            >
              Записаться снова
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal; 
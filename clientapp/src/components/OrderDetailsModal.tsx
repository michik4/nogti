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
  formatOrderDate
} from '@/utils/order.util';
import { roundPrice, formatPrice } from '@/utils/format.util';

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
    const designId = order.designSnapshot?.originalDesignId;
    if (designId && onBookAgain) {
      onBookAgain(designId);
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
          {/* Услуга */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Услуга
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">У</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {order.masterService?.name || 'Услуга не указана'}
                  </h3>
                  <p className="text-muted-foreground">
                    {order.masterService?.description || 'Описание отсутствует'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Длительность: {order.masterService?.duration || 'Не указана'} мин
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(order.masterService?.price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дизайн (если выбран) */}
          {order.designSnapshot && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Выбранный дизайн
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={getImageUrl(order.designSnapshot?.imageUrl) || '/placeholder.svg'} 
                      alt={order.designSnapshot?.title}
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {order.designSnapshot?.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {order.designSnapshot?.description || 'Описание отсутствует'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">
                        {order.designSnapshot?.type === 'basic' ? 'Базовый' : 'Дизайнерский'}
                      </Badge>
                      {order.designSnapshot?.color && (
                        <Badge variant="outline">
                          Цвет: {order.designSnapshot?.color}
                        </Badge>
                      )}
                    </div>
                    
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Стоимость */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Стоимость заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Разбивка стоимости */}
              <div className="space-y-3">
                {/* Услуга */}
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm font-medium">У</span>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Услуга</span>
                      <p className="text-xs text-muted-foreground">{order.masterService?.name}</p>
                    </div>
                  </div>вава
                  <span className="font-semibold text-primary">{formatPrice(order.masterService?.price || 0)}</span>
                </div>
                
                {/* Дизайн (если есть) */}
                {order.designSnapshot && (
                  <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg border border-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-secondary-foreground text-sm font-medium">Д</span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Дизайн</span>
                        <p className="text-xs text-muted-foreground">{order.designSnapshot.title}</p>
                      </div>
                    </div>
                    {(() => {
                      const designPrice = (order.price || 0) - (order.masterService?.price || 0);
                      return designPrice > 0 ? (
                        <span className="font-semibold text-secondary-foreground bg-secondary/20 px-2 py-1 rounded-md">
                          +{formatPrice(designPrice)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Бесплатно</span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Итоговая сумма */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div>
                  <span className="text-lg font-semibold">Итого к оплате</span>
                  {order.designSnapshot && (
                    <p className="text-xs text-muted-foreground">Включая дизайн</p>
                  )}
                </div>
                <span className="text-2xl font-bold text-primary">{formatPrice(order.price || 0)}</span>
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
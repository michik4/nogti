import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Phone, MessageSquare, AlertCircle, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types/booking.types";
import { getImageUrl } from "@/utils/image.util";
import { roundPrice } from "@/utils/format.util";
import { 
  getOrderStatusColor, 
  getOrderStatusText, 
  getOrderStatusDescription,
  canCancelOrder,
  canAcceptProposedTime,
  canBookAgain,
  formatOrderDate,
} from "@/utils/order.util";
import OrderDetailsModal from "@/components/OrderDetailsModal";

interface BookingsTabProps {
  onBookAgain: (designId: string) => void;
}

/**
 * Компонент вкладки с записями пользователя
 * Отображает список заказов и позволяет управлять ими
 */
const BookingsTab: React.FC<BookingsTabProps> = ({ onBookAgain }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  // Загрузка заказов
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getUserOrders(1, 10); // Показываем первые 10 заказов
      
      console.log('Response from orderService:', response);
      
      // Обрабатываем ответ в зависимости от структуры
      let ordersData: Order[] = [];
      
      // Проверяем структуру ответа
      if (response && response.success && response.data) {
        // Если это обертка с success и data содержит пагинированные данные
        if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          ordersData = response.data;
        }
      } else if (Array.isArray(response)) {
        // Если response сам является массивом
        ordersData = response;
      }
      
      console.log('Processed orders data:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setError('Не удалось загрузить заказы');
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Открытие модального окна с деталями
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Обновление заказа после изменения в модальном окне
  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  // Отмена заказа
  const handleCancelOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await orderService.cancelOrder(orderId);
      
      // Обновляем локальное состояние
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: OrderStatus.CANCELLED }
          : order
      ));
      
      toast({
        title: "Заказ отменен",
        description: "Ваш заказ был успешно отменен",
      });
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
  const handleAcceptProposedTime = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await orderService.acceptProposedTime(orderId);
      
      // Обновляем локальное состояние
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: OrderStatus.CONFIRMED, confirmedDateTime: order.proposedDateTime }
          : order
      ));
      
      toast({
        title: "Время подтверждено",
        description: "Вы приняли предложенное время",
      });
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
  const handleBookAgain = (order: Order) => {
    if (order.nailDesign) {
      onBookAgain(order.nailDesign.id);
    } else {
      toast({
        title: "Повторная запись",
        description: "Функция повторной записи будет доступна в следующем обновлении",
      });
    }
  };

  // Показать все заказы
  const handleViewAllOrders = () => {
    toast({
      title: "Все заказы",
      description: "Показаны все ваши заказы",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Мои записи
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Загрузка заказов...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Мои записи
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="ml-2 text-red-500">{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadOrders}
            className="ml-4"
          >
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Мои записи ({orders.length})
            </div>
            <Button size="sm" variant="outline" onClick={handleViewAllOrders}>
              Все записи
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.slice(0, 3).map((order) => (
            <div 
              key={order.id} 
              className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleOrderClick(order)}
            >
              <div className="flex gap-4">
                {/* Изображение дизайна или аватар мастера */}
                <div className="flex-shrink-0">
                  {order.nailDesign ? (
                    <img 
                                              src={getImageUrl(order.nailDesign.imageUrl) || '/placeholder.svg'} 
                      alt={order.nailDesign.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <SmartAvatar 
                      src={order.nailMaster.avatar} 
                      alt={order.nailMaster.fullName}
                      fallback={order.nailMaster.fullName.charAt(0).toUpperCase()}
                      className="w-16 h-16"
                    />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  {/* Заголовок и статус */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {order.nailDesign?.title || order.masterService?.name || 'Услуга не указана'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{order.nailMaster.fullName}</span>
                        {order.nailMaster.address && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{order.nailMaster.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getOrderStatusColor(order.status)} border`}
                      >
                        {getOrderStatusText(order.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Описание статуса */}
                  <p className="text-sm text-muted-foreground">
                    {getOrderStatusDescription(order.status)}
                  </p>

                  {/* Время */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {order.status === OrderStatus.ALTERNATIVE_PROPOSED && order.proposedDateTime
                          ? `Предложено: ${formatOrderDate(order.proposedDateTime)}`
                          : order.confirmedDateTime
                          ? `Подтверждено: ${formatOrderDate(order.confirmedDateTime)}`
                          : `Запись на: ${formatOrderDate(order.requestedDateTime)}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Заметки мастера */}
                  {order.masterNotes && (
                    <div className="flex items-start gap-2 text-sm bg-muted p-2 rounded">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Заметка от мастера:</p>
                        <p className="text-muted-foreground">{order.masterNotes}</p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Цена и действия */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">
                      {roundPrice(order.price)} ₽
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {/* Принять предложенное время */}
                      {canAcceptProposedTime(order.status) && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptProposedTime(order.id);
                          }}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Принять время"
                          )}
                        </Button>
                      )}
                      
                      {/* Отменить заказ */}
                      {canCancelOrder(order.status) && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id);
                          }}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Отменить"
                          )}
                        </Button>
                      )}
                      
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">У вас пока нет записей</p>
              <p className="text-sm text-muted-foreground mt-2">
                Найдите мастера и запишитесь на услугу
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно с деталями заказа */}
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
        onBookAgain={onBookAgain}
      />
    </>
  );
};

export default BookingsTab;

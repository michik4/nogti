import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  Loader2, 
  Eye,
  CheckCircle,
  XCircle,
  ClockIcon,
  User,
  Star,
  DollarSign
} from "lucide-react";
import styles from "./MasterOrdersTab.module.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types/booking.types";
import { getImageUrl } from "@/utils/image.util";
import { 
  getOrderStatusColor, 
  getOrderStatusText, 
  getOrderStatusDescription,
  formatOrderDate,
  canCompleteOrder
} from "@/utils/order.util";
import { roundPrice, formatPrice } from "@/utils/format.util";
import { calculateOrderTotalPrice, hasOrderDesign } from "@/utils/order.util";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import CompleteOrderModal from "@/components/CompleteOrderModal";

interface MasterOrdersTabProps {
  masterId: string;
}

/**
 * Компонент вкладки с заказами мастера
 * Отображает список заказов и позволяет управлять их статусами
 */
const MasterOrdersTab: React.FC<MasterOrdersTabProps> = ({ masterId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "completed" | "all">("pending");
  const { toast } = useToast();

  // Загрузка заказов
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getUserOrders(1, 50); // Загружаем больше заказов для мастера
      
      console.log('Response from orderService:', response);
      
      // Обрабатываем ответ в зависимости от структуры
      let ordersData: Order[] = [];
      
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          ordersData = response.data;
        }
      } else if (Array.isArray(response)) {
        ordersData = response;
      }
      
      console.log('Processed orders data:', ordersData);
      
      // Фильтруем некорректные заказы
      const validOrders = ordersData.filter(order => 
        order && 
        order.id && 
        order.status && 
        order.client && 
        order.masterService
      );
      
      setOrders(validOrders);
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

  // Подтверждение заказа
  const handleConfirmOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      const updatedOrder = await orderService.confirmOrder(orderId);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      toast({
        title: "Успех",
        description: "Заказ подтвержден",
      });
    } catch (error) {
      console.error('Ошибка подтверждения заказа:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить заказ",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Отклонение заказа
  const handleDeclineOrder = async (orderId: string, reason?: string) => {
    try {
      setActionLoading(orderId);
      const updatedOrder = await orderService.declineOrder(orderId, reason);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      toast({
        title: "Успех",
        description: "Заказ отклонен",
      });
    } catch (error) {
      console.error('Ошибка отклонения заказа:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить заказ",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Предложение альтернативного времени
  const handleProposeTime = async (orderId: string, proposedDateTime: string, notes?: string) => {
    try {
      setActionLoading(orderId);
      const updatedOrder = await orderService.proposeAlternativeTime(orderId, proposedDateTime, notes);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      toast({
        title: "Успех",
        description: "Предложено альтернативное время",
      });
    } catch (error) {
      console.error('Ошибка предложения времени:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось предложить альтернативное время",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Открытие модального окна завершения заказа
  const handleOpenCompleteModal = (order: Order) => {
    setOrderToComplete(order);
    setIsCompleteModalOpen(true);
  };

  // Завершение заказа
  const handleCompleteOrder = async (masterNotes?: string, rating?: number) => {
    if (!orderToComplete) return;

    try {
      setActionLoading(orderToComplete.id);
      const updatedOrder = await orderService.completeOrder(orderToComplete.id, masterNotes, rating);
      setOrders(orders.map(order => 
        order.id === orderToComplete.id ? updatedOrder : order
      ));
      toast({
        title: "Успех",
        description: "Заказ завершен",
      });
    } catch (error) {
      console.error('Ошибка завершения заказа:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить заказ",
        variant: "destructive",
      });
      throw error; // Пробрасываем ошибку для обработки в модальном окне
    } finally {
      setActionLoading(null);
    }
  };

  // Фильтрация заказов по статусу
  const getFilteredOrders = () => {
    switch (activeTab) {
      case "pending":
        return orders.filter(order => order.status === OrderStatus.PENDING);
      case "active":
        return orders.filter(order => 
          order.status === OrderStatus.CONFIRMED || 
          order.status === OrderStatus.ALTERNATIVE_PROPOSED
        );
      case "completed":
        return orders.filter(order => 
          order.status === OrderStatus.COMPLETED || 
          order.status === OrderStatus.CANCELLED ||
          order.status === OrderStatus.DECLINED
        );
      default:
        return orders;
    }
  };

  // Получение счетчиков для табов
  const getTabCounts = () => {
    return {
      pending: orders.filter(order => order.status === OrderStatus.PENDING).length,
      active: orders.filter(order => 
        order.status === OrderStatus.CONFIRMED || 
        order.status === OrderStatus.ALTERNATIVE_PROPOSED
      ).length,
      completed: orders.filter(order => 
        order.status === OrderStatus.COMPLETED || 
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.DECLINED
      ).length,
      all: orders.length
    };
  };

  // Рендер карточки заказа
  const renderOrderCard = (order: Order) => {
    if (!order) return null;
    
    const isLoading = actionLoading === order.id;
    const canRespond = order.status === OrderStatus.PENDING;
    const isActive = order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.ALTERNATIVE_PROPOSED;
    const canComplete = canCompleteOrder(order.status, order.confirmedDateTime);

    return (
      <Card key={order.id} className={`overflow-hidden ${styles.orderCard}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <SmartAvatar 
                src={order.client?.avatar} 
                alt={order.client?.fullName}
                fallback={order.client?.fullName?.[0]?.toUpperCase() || 'К'}
                className="w-10 h-10"
              />
              <div>
                <h4 className="font-medium">{order.client?.fullName || 'Клиент'}</h4>
                <p className="text-sm text-muted-foreground">
                  {order.masterService?.name || 'Услуга'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={getOrderStatusColor(order.status)}>
              {getOrderStatusText(order.status)}
            </Badge>
          </div>

          {/* Дизайн если есть */}
          {order.nailDesign && (
            <div className="flex items-center gap-2 mb-3">
              <img 
                                              src={getImageUrl(order.nailDesign?.imageUrl) || '/placeholder.svg'} 
                alt={order.nailDesign?.title || 'Дизайн'}
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <p className="text-sm font-medium">{order.nailDesign?.title || 'Дизайн'}</p>
                <p className="text-xs text-muted-foreground">{order.nailDesign?.type || 'basic'}</p>
              </div>
            </div>
          )}

          {/* Информация о времени */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Запись на: {formatOrderDate(order.requestedDateTime)}</span>
            </div>
            {order.proposedDateTime && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <ClockIcon className="w-4 h-4" />
                <span>Предложено: {formatOrderDate(order.proposedDateTime)}</span>
              </div>
            )}
            {order.confirmedDateTime && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Подтверждено: {formatOrderDate(order.confirmedDateTime)}</span>
              </div>
            )}
            {order.completedAt && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span>Завершено: {formatOrderDate(order.completedAt)}</span>
                {order.rating && (
                  <span className="ml-2 text-yellow-600">★ {order.rating}/5</span>
                )}
              </div>
            )}
          </div>

          {/* Цена */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-semibold">
                {formatPrice(calculateOrderTotalPrice(order))}
              </span>
              {hasOrderDesign(order) && (
                <span className="text-xs text-muted-foreground">
                  (включая дизайн)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{order.masterService?.duration || 0} мин</span>
            </div>
          </div>

          {/* Заметки */}
          {order.clientNotes && (
            <div className={styles.clientNotes}>
              <p className="font-medium mb-1">Заметки клиента:</p>
              <p>{order.clientNotes}</p>
            </div>
          )}

          {order.masterNotes && (
            <div className={styles.masterNotes}>
              <p className="font-medium mb-1">Ваши заметки:</p>
              <p>{order.masterNotes}</p>
            </div>
          )}

          {/* Действия */}
          <div className={styles.actionButtons}>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOrderClick(order)}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-1" />
              Подробнее
            </Button>

            {canRespond && (
              <>
                <Button 
                  size="sm"
                  onClick={() => handleConfirmOrder(order.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  Подтвердить
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeclineOrder(order.id)}
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Отклонить
                </Button>
              </>
            )}

            {canComplete && (
              <Button 
                size="sm"
                variant="default"
                onClick={() => handleOpenCompleteModal(order)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-1" />
                )}
                Завершить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <AlertCircle className={styles.errorIcon} />
        <p className="text-destructive">{error}</p>
        <Button onClick={loadOrders} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    );
  }

  const tabCounts = getTabCounts();
  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Ожидают ({tabCounts.pending})
            {tabCounts.pending > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Активные ({tabCounts.active})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Завершенные ({tabCounts.completed})
          </TabsTrigger>
          <TabsTrigger value="all">
            Все ({tabCounts.all})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar className={styles.emptyStateIcon} />
              <p className="text-muted-foreground">
                {activeTab === "pending" && "Нет заказов, ожидающих ответа"}
                {activeTab === "active" && "Нет активных заказов"}
                {activeTab === "completed" && "Нет завершенных заказов"}
                {activeTab === "all" && "У вас пока нет заказов"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.filter(order => order).map(renderOrderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Модальное окно с деталями заказа */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onOrderUpdate={handleOrderUpdate}
        />
      )}

      {/* Модальное окно завершения заказа */}
      <CompleteOrderModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setOrderToComplete(null);
        }}
        onComplete={handleCompleteOrder}
        order={orderToComplete}
      />
    </div>
  );
};

export default MasterOrdersTab; 
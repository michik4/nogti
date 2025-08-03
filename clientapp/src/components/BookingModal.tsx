import { useState, useCallback } from "react";
import { Calendar, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/format.util";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/services/orderService";
import { CreateOrderData } from "@/types/booking.types";
import { User } from "@/types/user.types";
import { MasterService, MasterServiceDesign } from "@/types/master.types";
import { TimeSlot } from "@/types/schedule.types";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/image.util";
import AvailableSlotsSelector from "./booking/AvailableSlotsSelector";
import ClientInfoForm, { ClientInfo } from "./booking/ClientInfoForm";
import DesignInfo from "./booking/DesignInfo";
import DesignSelectionModal from "./booking/DesignSelectionModal";
import ConvertGuestModal from "./ConvertGuestModal";
import React from "react"; // Added missing import

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: MasterService | null; // Услуга вместо дизайна
  masterId?: string;
  preselectedDesignId?: string; // ID предвыбранного дизайна (например, с страницы дизайна)
}

/**
 * Модальное окно для записи клиента к мастеру
 * Позволяет клиентам создавать запросы на бронирование
 */
const BookingModal = ({ isOpen, onClose, service, masterId, preselectedDesignId }: BookingModalProps) => {
  const { user, isAuthenticated, isClient, isGuest } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<MasterServiceDesign | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);

  // Эффект для установки предвыбранного дизайна при открытии модалки
  React.useEffect(() => {
    if (isOpen && preselectedDesignId) {
      // Если есть предвыбранный дизайн, нам нужно найти соответствующий MasterServiceDesign
      // Это будет сделано в DesignSelector, который загрузит список и найдет нужный
      console.log('Предвыбранный дизайн ID:', preselectedDesignId);
    }
  }, [isOpen, preselectedDesignId]);

  // Эффект для сброса формы при закрытии модального окна
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, preselectedDesignId]);

  const handleBooking = async () => {
    console.log('=== Начало handleBooking ===');
    console.log('selectedSlot:', selectedSlot);
    console.log('service:', service);
    console.log('selectedDesign:', selectedDesign);
    console.log('masterId:', masterId);
    console.log('user:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isClient():', isClient());
    console.log('Token в localStorage:', localStorage.getItem('auth_token'));
    
    if (!selectedSlot || !service) {
      toast.error("Пожалуйста, выберите доступное окно и услугу");
      return;
    }

    // Проверяем авторизацию
    if (!isAuthenticated) {
      toast.error("Для записи необходимо войти в систему");
      return;
    }

    // Проверяем роль пользователя
    if (isGuest()) {
      setShowConvertModal(true);
      return;
    }

    if (!isClient()) {
      toast.error("Записаться могут только клиенты");
      return;
    }

    if (!masterId) {
      toast.error("ID мастера не найден");
      return;
    }

    setIsLoading(true);

    try {
      // Формируем дату и время из выбранного окна
      const requestedDateTime = new Date(selectedSlot.workDate + 'T' + selectedSlot.startTime);

      const orderData: CreateOrderData = {
        masterServiceId: service.id,
        nailDesignId: selectedDesign?.nailDesign.id,
        nailMasterId: masterId,
        requestedDateTime: requestedDateTime.toISOString(),
        description: `Запись на ${service.name}${selectedDesign ? ` - ${selectedDesign.nailDesign.title}` : ''} (${service.price}₽${selectedDesign?.customPrice ? ` + ${selectedDesign.customPrice}₽` : ''})`,
        clientNotes: clientInfo.notes || undefined
      };

      console.log('Отправляем orderData:', orderData);
      const order = await orderService.createOrder(orderData);
      console.log('Получен ответ:', order);

      if (order && order.id) {
        toast.success("Запись успешно создана! Мастер свяжется с вами для подтверждения.");
        resetForm();
        onClose();
      } else {
        toast.error("Ошибка при создании записи");
      }
    } catch (error) {
      console.error('Ошибка создания записи:', error);
      toast.error("Произошла ошибка при создании записи");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSlot(null);
    // Если нет предвыбранного дизайна, сбрасываем выбор дизайна
    if (!preselectedDesignId) {
      setSelectedDesign(null);
    }
    setClientInfo({ name: "", phone: "", email: "", notes: "" });
  };

  const handleClientInfoChange = useCallback((updates: Partial<ClientInfo>) => {
    setClientInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const handleConvertModalClose = useCallback(() => {
    setShowConvertModal(false);
  }, []);

  const handleDesignSelect = useCallback((design: MasterServiceDesign | null) => {
    setSelectedDesign(design);
  }, []);

  // Функция для расчета общей стоимости
  const calculateTotalPrice = () => {
    let total = service?.price || 0;
    if (selectedDesign?.customPrice) {
      total += selectedDesign.customPrice;
    }
    return total;
  };

  if (!service) return null;

  // Если пользователь не клиент и не гость, не показываем модалку
  if (isAuthenticated && !isClient() && !isGuest()) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Записаться на маникюр</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Service Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-primary">{formatPrice(service.price)}</span>
                <span className="text-muted-foreground">{service.duration} мин</span>
                {selectedDesign?.customPrice && (
                  <span className="text-xs text-muted-foreground">
                    +{formatPrice(selectedDesign.customPrice)} за дизайн
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Design Selection Button */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Дизайн</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDesignModal(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {selectedDesign ? 'Изменить дизайн' : 'Выбрать дизайн'}
                </Button>
              </div>
              
              {/* Selected Design Info */}
              {selectedDesign && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(selectedDesign.nailDesign.imageUrl)}
                      alt={selectedDesign.nailDesign.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedDesign.nailDesign.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {selectedDesign.nailDesign.type === "basic" ? "Базовый" : "Дизайнерский"}
                        </Badge>
                        {selectedDesign.customPrice && (
                          <span className="text-primary font-medium">
                            +{formatPrice(selectedDesign.customPrice)}
                          </span>
                        )}
                        {selectedDesign.additionalDuration && selectedDesign.additionalDuration > 0 && (
                          <span>+{selectedDesign.additionalDuration} мин</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDesign(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Total Price */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="font-semibold text-lg text-foreground">Общая стоимость</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Услуга */}
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">У</span>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Услуга</span>
                          <p className="text-xs text-muted-foreground">{service.name}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">{formatPrice(service.price)}</span>
                    </div>
                    
                    {/* Дизайн (если выбран) */}
                    {selectedDesign && selectedDesign.customPrice && (
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-secondary/30 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-secondary-foreground text-sm font-medium">Д</span>
                          </div>
                          <div>
                            <span className="font-medium text-sm text-foreground">Дизайн</span>
                            <p className="text-xs text-muted-foreground">{selectedDesign.nailDesign.title}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-secondary-foreground bg-secondary/20 px-2 py-1 rounded-md">+{formatPrice(selectedDesign.customPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Итоговая сумма */}
                <div className="ml-6 p-4 bg-primary/10 rounded-lg border border-primary/30 min-w-[140px]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(calculateTotalPrice())}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Итого к оплате
                    </div>
                    {selectedDesign && selectedDesign.customPrice && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Включая дизайн
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Available Slots Selection */}
            {masterId && (
              <AvailableSlotsSelector
                masterId={masterId}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
              />
            )}

            <Separator />

            {/* Client Information - показываем только если пользователь не авторизован или гость */}
            {(!isAuthenticated || isGuest()) && (
              <>
                <ClientInfoForm
                  clientInfo={clientInfo}
                  onClientInfoChange={handleClientInfoChange}
                  showEmail={true}
                />
                <Separator />
              </>
            )}

            {/* Информация для авторизованных клиентов */}
            {isAuthenticated && isClient() && user && 'email' in user && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Запись будет создана на имя:</p>
                <p className="font-medium">{(user as User).fullName || (user as User).email}</p>
                {(user as User).phone && <p className="text-sm text-muted-foreground">{(user as User).phone}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                Отмена
              </Button>
              <Button 
                onClick={handleBooking} 
                className="flex-1" 
                disabled={isLoading || !selectedSlot}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isLoading ? "Создание записи..." : "Записаться"}
              </Button>
            </div>

            {/* Предупреждение для неавторизованных */}
            {!isAuthenticated && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Для записи необходимо войти в систему или зарегистрироваться
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка конвертации гостя */}
      <ConvertGuestModal
        isOpen={showConvertModal}
        onClose={handleConvertModalClose}
      />

      {/* Модалка выбора дизайна */}
      <DesignSelectionModal
        isOpen={showDesignModal}
        onClose={() => setShowDesignModal(false)}
        serviceId={service.id}
        selectedDesign={selectedDesign}
        onDesignSelect={handleDesignSelect}
        preselectedDesignId={preselectedDesignId}
      />
    </>
  );
};

export default BookingModal;

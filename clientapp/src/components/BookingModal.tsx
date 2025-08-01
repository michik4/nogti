import { useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/services/orderService";
import { CreateOrderData } from "@/types/booking.types";
import { User } from "@/types/user.types";
import { MasterService, MasterServiceDesign } from "@/types/master.types";
import { toast } from "sonner";
import DateTimeSelector from "./booking/DateTimeSelector";
import ClientInfoForm, { ClientInfo } from "./booking/ClientInfoForm";
import DesignInfo from "./booking/DesignInfo";
import DesignSelector from "./booking/DesignSelector";
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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<MasterServiceDesign | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

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
    console.log('selectedDate:', selectedDate);
    console.log('selectedTime:', selectedTime);
    console.log('service:', service);
    console.log('selectedDesign:', selectedDesign);
    console.log('masterId:', masterId);
    console.log('user:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isClient():', isClient());
    console.log('Token в localStorage:', localStorage.getItem('auth_token'));
    
    if (!selectedDate || !selectedTime || !service) {
      toast.error("Пожалуйста, заполните все обязательные поля");
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
      // Формируем дату и время для отправки
      const requestedDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      requestedDateTime.setHours(parseInt(hours), parseInt(minutes));

      const orderData: CreateOrderData = {
        masterServiceId: service.id,
        nailDesignId: selectedDesign?.nailDesign.id,
        nailMasterId: masterId,
        requestedDateTime: requestedDateTime.toISOString(),
        description: `Запись на ${service.name}${selectedDesign ? ` - ${selectedDesign.nailDesign.title}` : ''}`,
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
    setSelectedDate(undefined);
    setSelectedTime("");
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
                <span className="font-medium text-primary">{service.price}₽</span>
                <span className="text-muted-foreground">{service.duration} мин</span>
              </div>
            </div>

            <Separator />

            {/* Design Selection */}
            <DesignSelector
              serviceId={service.id}
              selectedDesignId={preselectedDesignId || selectedDesign?.nailDesign.id}
              onDesignSelect={handleDesignSelect}
            />

            <Separator />

            {/* Date and Time Selection */}
            <DateTimeSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              disableWeekends={true}
              masterId={masterId}
              useMasterSchedule={true}
            />

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
              <Button onClick={handleBooking} className="flex-1" disabled={isLoading}>
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
    </>
  );
};

export default BookingModal;

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Заглушка: функциональность создания записей пока не реализована
// import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DateTimeSelector from "./booking/DateTimeSelector";
import ClientInfoForm, { ClientInfo } from "./booking/ClientInfoForm";
import DesignSelector from "./booking/DesignSelector";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно для создания новой записи мастером
 * Позволяет мастеру создавать записи для своих клиентов
 */
const CreateBookingModal = ({ isOpen, onClose }: CreateBookingModalProps) => {
  // Заглушка: данные и функции
  const currentUser = null;
  const designs: any[] = [];
  const addBooking = (booking: any) => {
    console.log('Создание записи (заглушка):', booking);
  };
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    phone: "",
    notes: ""
  });

  const handleCreateBooking = () => {
    if (!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.phone) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      clientName: clientInfo.name,
      masterName: "Мастер",
      service: "Маникюр + гель-лак",
      design: selectedDesign ? selectedDesign.nailDesign?.title || "Выбранный дизайн" : "Без дизайна",
      date: selectedDate.toLocaleDateString('ru-RU'),
      time: selectedTime,
      price: "2500₽",
      status: "confirmed" as const,
      image: selectedDesign ? selectedDesign.nailDesign?.image || "/placeholder.svg" : "/placeholder.svg"
    };

    addBooking(newBooking);
    toast.success("Запись успешно создана!");
    
    // Сброс формы
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedDesign(null);
    setSelectedServiceId("");
    setClientInfo({ name: "", phone: "", notes: "" });
  };

  const handleClientInfoChange = (updates: Partial<ClientInfo>) => {
    setClientInfo(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новую запись</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client Information */}
          <ClientInfoForm
            clientInfo={clientInfo}
            onClientInfoChange={handleClientInfoChange}
          />

          {/* Design Selection */}
          {selectedServiceId && (
            <DesignSelector
              serviceId={selectedServiceId}
              selectedDesignId={selectedDesign?.nailDesign?.id}
              onDesignSelect={setSelectedDesign}
            />
          )}
          
          {/* Service Selection - добавим простой селектор */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите услугу (для демонстрации)</label>
            <select 
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Выберите услугу</option>
              <option value="demo-service-1">Маникюр + гель-лак</option>
              <option value="demo-service-2">Педикюр</option>
            </select>
          </div>

          {/* Date and Time Selection */}
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleCreateBooking} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Создать запись
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingModal;

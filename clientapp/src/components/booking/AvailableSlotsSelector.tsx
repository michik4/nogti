import { useState, useEffect } from "react";
import { Clock, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scheduleService } from "@/services/scheduleService";
import { TimeSlot, ScheduleDay } from "@/types/schedule.types";
import { toast } from "sonner";

interface AvailableSlotsSelectorProps {
  masterId: string;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot | null) => void;
  className?: string;
}

/**
 * Компонент для выбора доступных окон мастера
 * Показывает расписание мастера и позволяет выбрать свободное окно
 */
const AvailableSlotsSelector = ({
  masterId,
  selectedSlot,
  onSlotSelect,
  className = ""
}: AvailableSlotsSelectorProps) => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Функция для форматирования времени без секунд
  const formatTimeDisplay = (time: string) => {
    return time.substring(0, 5); // Убираем секунды, оставляем только HH:MM
  };

  // Загружаем расписание мастера
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 14); // Показываем на 2 недели вперед
        
        const scheduleData = await scheduleService.getMasterSchedule(
          masterId,
          today.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        setSchedule(scheduleData);
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        toast.error('Не удалось загрузить расписание мастера');
      } finally {
        setIsLoading(false);
      }
    };

    if (masterId) {
      fetchSchedule();
    }
  }, [masterId]);

  // Получаем доступные окна для выбранной даты
  const getAvailableSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySchedule = schedule.find(day => day.date === dateStr);
    return daySchedule?.timeSlots.filter(slot => slot.status === 'available') || [];
  };

  // Получаем все даты с доступными окнами
  const getDatesWithAvailableSlots = () => {
    return schedule.filter(day => 
      day.timeSlots.some(slot => slot.status === 'available')
    );
  };

  // Обработчик выбора окна
  const handleSlotSelect = (slot: TimeSlot) => {
    if (selectedSlot?.id === slot.id) {
      onSlotSelect(null); // Отменяем выбор
    } else {
      onSlotSelect(slot);
    }
  };

  // Обработчик выбора даты
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onSlotSelect(null); // Сбрасываем выбранное окно при смене даты
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Label className="text-base font-semibold">Доступные окна мастера *</Label>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Загрузка расписания...</span>
        </div>
      </div>
    );
  }

  const datesWithSlots = getDatesWithAvailableSlots();
  const availableSlots = getAvailableSlotsForDate(selectedDate);

  if (datesWithSlots.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Label className="text-base font-semibold">Доступные окна мастера *</Label>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>У мастера нет свободных окон в ближайшие 2 недели</p>
          <p className="text-sm mt-2">Попробуйте позже или свяжитесь с мастером</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-base font-semibold">Доступные окна мастера *</Label>
      
      {/* Выбор даты */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Выберите дату:</Label>
        <div className="flex flex-wrap gap-2">
          {datesWithSlots.slice(0, 7).map((day) => {
            const date = new Date(day.date);
            const isSelected = selectedDate.toISOString().split('T')[0] === day.date;
            const availableCount = day.timeSlots.filter(slot => slot.status === 'available').length;
            
            return (
              <Button
                key={day.date}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateSelect(date)}
                className="flex flex-col items-center p-2 h-auto"
              >
                <span className="text-xs">
                  {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                </span>
                <span className="font-medium">
                  {date.getDate()}
                </span>
                <Badge variant="secondary" className="text-xs mt-1">
                  {availableCount} окон
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Доступные окна для выбранной даты */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Время на {selectedDate.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}:
        </Label>
        
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              
              return (
                <Button
                  key={slot.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSlotSelect(slot)}
                  className="flex items-center justify-center p-3 h-auto"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                  </span>
                  {isSelected && <Check className="w-4 h-4 ml-2" />}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>На выбранную дату нет свободных окон</p>
          </div>
        )}
      </div>

      {/* Информация о выбранном окне */}
      {selectedSlot && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Выбрано:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeDisplay(selectedSlot.startTime)} - {formatTimeDisplay(selectedSlot.endTime)}
                </p>
              </div>
              <Badge variant="secondary">
                Свободно
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailableSlotsSelector; 
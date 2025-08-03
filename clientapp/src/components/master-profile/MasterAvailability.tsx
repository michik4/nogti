import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scheduleService } from "@/services/scheduleService";
import { TimeSlot, ScheduleDay } from "@/types/schedule.types";


interface MasterAvailabilityProps {
  masterId: string;
  className?: string;
}

const MasterAvailability = ({ masterId, className = "" }: MasterAvailabilityProps) => {
  const [todaySchedule, setTodaySchedule] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [fullSchedule, setFullSchedule] = useState<ScheduleDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredSchedule, setFilteredSchedule] = useState<ScheduleDay[]>([]);

  // Функция для форматирования времени без секунд
  const formatTimeDisplay = (time: string) => {
    return time.substring(0, 5); // Убираем секунды, оставляем только HH:MM
  };

  // Получаем расписание на сегодня
  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const schedule = await scheduleService.getMasterSchedule(masterId, today, today);
        
        if (schedule.length > 0) {
          setTodaySchedule(schedule[0].timeSlots);
        } else {
          setTodaySchedule([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки расписания на сегодня:', error);
        setTodaySchedule([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (masterId) {
      fetchTodaySchedule();
    }
  }, [masterId]);

  // Получаем полное расписание
  const fetchFullSchedule = async () => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30); // Показываем на месяц вперед
      
      const schedule = await scheduleService.getMasterSchedule(
        masterId, 
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setFullSchedule(schedule);
      setFilteredSchedule(schedule); // Инициализируем отфильтрованное расписание
    } catch (error) {
      console.error('Ошибка загрузки полного расписания:', error);
    }
  };

  // Генерируем даты для ближайшей недели
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNumber: date.getDate(),
        isToday: i === 0
      });
    }
    
    return dates;
  };

  // Фильтрация расписания по выбранной дате
  const handleDateFilter = (date: string) => {
    if (date === selectedDate) {
      // Если та же дата выбрана снова, показываем все
      setSelectedDate('');
      setFilteredSchedule(fullSchedule);
    } else {
      // Фильтруем по выбранной дате
      setSelectedDate(date);
      const filtered = fullSchedule.filter(day => day.date === date);
      setFilteredSchedule(filtered);
    }
  };

  // Получаем самое позднее время работы сегодня
  const getLatestWorkTime = () => {
    if (todaySchedule.length === 0) return null;
    
    const availableSlots = todaySchedule.filter(slot => slot.status === 'available');
    if (availableSlots.length === 0) return null;
    
    const latestSlot = availableSlots.reduce((latest, slot) => {
      return slot.endTime > latest.endTime ? slot : latest;
    });
    
    return formatTimeDisplay(latestSlot.endTime);
  };

  // Получаем количество доступных окон сегодня
  const getAvailableSlotsCount = () => {
    return todaySchedule.filter(slot => slot.status === 'available').length;
  };

  const handleShowFullSchedule = async () => {
    setShowFullSchedule(true);
    await fetchFullSchedule();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'booked': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Свободно';
      case 'booked': return 'Забронировано';
      case 'blocked': return 'Заблокировано';
      default: return 'Неизвестно';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Clock className="w-5 h-5 animate-pulse" />
        <span className="animate-pulse">Загрузка расписания...</span>
      </div>
    );
  }

  const latestTime = getLatestWorkTime();
  const availableSlotsCount = getAvailableSlotsCount();

  return (
    <>
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Clock className="w-5 h-5" />
        {latestTime ? (
          <span>Сегодня до {latestTime}</span>
        ) : (
          <span>Сегодня нет записи</span>
        )}
        {availableSlotsCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {availableSlotsCount} окон
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShowFullSchedule}
          className="ml-2 h-6 px-2 text-xs"
        >
          <Calendar className="w-3 h-3 mr-1" />
          Расписание
        </Button>
      </div>

      {/* Модалка с полным расписанием */}
      <Dialog open={showFullSchedule} onOpenChange={setShowFullSchedule}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Расписание мастера
            </DialogTitle>
          </DialogHeader>

                     {/* Кнопки фильтров по дням */}
           <div className="mb-6">
             <div className="flex gap-2 overflow-x-auto p-2">
               {getWeekDates().map(({ date, dayName, dayNumber, isToday }) => {
                 const hasSchedule = fullSchedule.some(day => day.date === date);
                 const isSelected = selectedDate === date;
                 
                 return (
                   <Button
                     key={date}
                     variant={isSelected ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => handleDateFilter(date)}
                     className={`flex-shrink-0 ${isToday ? 'ring-2 ring-primary' : ''}`}
                     disabled={!hasSchedule}
                   >
                     <div className="text-center">
                       <div className="text-xs text-muted-foreground">{dayName}</div>
                       <div className="font-medium">{dayNumber}</div>
                     </div>
                   </Button>
                 );
               })}
               
               <Button
                 variant={selectedDate === '' ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => {
                   setSelectedDate('');
                   setFilteredSchedule(fullSchedule);
                 }}
                 className="flex-shrink-0"
               >
                 Все дни
               </Button>
             </div>
           </div>

          <div className="space-y-4">
            {filteredSchedule.length > 0 ? (
              filteredSchedule.map((day) => (
                <Card key={day.date}>
                                     <CardHeader>
                     <CardTitle className="text-lg">
                       {(() => {
                         const date = new Date(day.date);
                         const dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' });
                         const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                         return date.toLocaleDateString('ru-RU', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                         }).replace(dayName, capitalizedDayName);
                       })()}
                     </CardTitle>
                   </CardHeader>
                  <CardContent>
                    {day.timeSlots.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {day.timeSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                              </span>
                            </div>
                            <Badge className={getStatusColor(slot.status)}>
                              {getStatusText(slot.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>Нет временных окон</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {selectedDate 
                    ? 'На выбранную дату расписание не найдено'
                    : 'Расписание не найдено'
                  }
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MasterAvailability; 
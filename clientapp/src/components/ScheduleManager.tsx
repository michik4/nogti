import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Edit, Check, X, Copy, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/scheduleService";
import { TimeSlot, ScheduleDay, CreateTimeSlotData, UpdateTimeSlotData } from "@/types/schedule.types";

interface ScheduleManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleManager = ({ isOpen, onClose }: ScheduleManagerProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [isWeekCopyMode, setIsWeekCopyMode] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [newSlot, setNewSlot] = useState({
    startTime: "09:00",
    endTime: "10:00",
    status: 'available' as const,
    notes: ""
  });
  const [weekTemplate, setWeekTemplate] = useState<{
    [dayOfWeek: number]: { startTime: string; endTime: string; status: 'available' | 'blocked' }[]
  }>({});

  const timeOptions = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00"
  ];

  const weekDays = [
    { value: 0, label: 'Воскресенье' },
    { value: 1, label: 'Понедельник' },
    { value: 2, label: 'Вторник' },
    { value: 3, label: 'Среда' },
    { value: 4, label: 'Четверг' },
    { value: 5, label: 'Пятница' },
    { value: 6, label: 'Суббота' }
  ];

  useEffect(() => {
    if (isOpen && user?.id) {
      loadSchedule();
    }
  }, [isOpen, user?.id]);

  const loadSchedule = async () => {
    try {
      if (!user?.id) return;
      
      const schedule = await scheduleService.getMySchedule();
      setScheduleDays(schedule);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
      toast.error('Не удалось загрузить расписание');
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDate && selectedDates.length === 0) {
      toast.error('Выберите дату');
      return;
    }

    try {
      const datesToAdd = selectedDates.length > 0 ? selectedDates : [selectedDate!];
      
      for (const date of datesToAdd) {
        const dateStr = date.toISOString().split('T')[0];
        const slotData: CreateTimeSlotData = {
          workDate: dateStr,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          status: newSlot.status,
          notes: newSlot.notes || undefined
        };

        const newTimeSlot = await scheduleService.addMyTimeSlot(slotData);

        // Обновляем локальное состояние
        setScheduleDays(prev => {
          const existingDay = prev.find(day => day.date === dateStr);
          if (existingDay) {
            return prev.map(day => 
              day.date === dateStr 
                ? { ...day, timeSlots: [...day.timeSlots, newTimeSlot] }
                : day
            );
          } else {
            return [...prev, { date: dateStr, timeSlots: [newTimeSlot] }];
          }
        });
      }

      setIsAddSlotOpen(false);
      setSelectedDates([]);
      setNewSlot({ startTime: "09:00", endTime: "10:00", status: 'available', notes: "" });
      toast.success(`Временное окно добавлено на ${datesToAdd.length} ${datesToAdd.length === 1 ? 'дату' : 'даты'}`);
    } catch (error: any) {
      console.error('Ошибка добавления временного окна:', error);
      
      // Показываем пользователю понятное сообщение об ошибке
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Не удалось добавить временное окно');
      }
    }
  };

  const handleCopyWeekSchedule = async () => {
    if (selectedDates.length === 0) {
      toast.error('Выберите даты для копирования');
      return;
    }

    try {
      // Создаем шаблон недели на основе выбранных дат
      const template: typeof weekTemplate = {};
      
      for (const date of selectedDates) {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        const daySchedule = scheduleDays.find(day => day.date === dateStr);
        
        if (daySchedule && daySchedule.timeSlots.length > 0) {
          template[dayOfWeek] = daySchedule.timeSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status as 'available' | 'blocked'
          }));
        }
      }

      setWeekTemplate(template);
      setIsWeekCopyMode(true);
      toast.success('Шаблон недели создан');
    } catch (error) {
      console.error('Ошибка создания шаблона недели:', error);
      toast.error('Не удалось создать шаблон недели');
    }
  };

  const handleApplyWeekTemplate = async () => {
    if (Object.keys(weekTemplate).length === 0) {
      toast.error('Нет шаблона для применения');
      return;
    }

    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      // Применяем шаблон на следующие 4 недели
      for (let week = 0; week < 4; week++) {
        for (const [dayOfWeek, slots] of Object.entries(weekTemplate)) {
          const targetDate = new Date(startDate);
          targetDate.setDate(startDate.getDate() + week * 7 + parseInt(dayOfWeek));
          
          // Пропускаем прошедшие даты
          if (targetDate < new Date()) continue;
          
          const dateStr = targetDate.toISOString().split('T')[0];
          
          for (const slot of slots) {
            const slotData: CreateTimeSlotData = {
              workDate: dateStr,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: slot.status,
              notes: 'Создано из шаблона недели'
            };

            await scheduleService.addMyTimeSlot(slotData);
          }
        }
      }

      await loadSchedule();
      setIsWeekCopyMode(false);
      setWeekTemplate({});
      toast.success('Шаблон недели применен на 4 недели');
    } catch (error: any) {
      console.error('Ошибка применения шаблона недели:', error);
      
      // Показываем пользователю понятное сообщение об ошибке
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Не удалось применить шаблон недели');
      }
    }
  };

  const handleUpdateSlot = async (slotId: string, updates: UpdateTimeSlotData) => {
    try {
      if (!user?.id) return;

      const updatedSlot = await scheduleService.updateMyTimeSlot(slotId, updates);

      setScheduleDays(prev => 
        prev.map(day => ({
          ...day,
          timeSlots: day.timeSlots.map(slot => 
            slot.id === slotId ? updatedSlot : slot
          )
        }))
      );

      setEditingSlot(null);
      toast.success('Временное окно обновлено');
    } catch (error) {
      console.error('Ошибка обновления временного окна:', error);
      toast.error('Не удалось обновить временное окно');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      if (!user?.id) return;

      await scheduleService.deleteMyTimeSlot(slotId);

      setScheduleDays(prev => 
        prev.map(day => ({
          ...day,
          timeSlots: day.timeSlots.filter(slot => slot.id !== slotId)
        }))
      );

      toast.success('Временное окно удалено');
    } catch (error) {
      console.error('Ошибка удаления временного окна:', error);
      toast.error('Не удалось удалить временное окно');
    }
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

  const selectedDaySchedule = scheduleDays.find(day => 
    selectedDate && day.date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Управление расписанием
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Календарь и управление */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={isMultiSelectMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedDates([]);
                }}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Множественный выбор
              </Button>
              {selectedDates.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWeekSchedule}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Создать шаблон
                </Button>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">
                {isMultiSelectMode ? 'Выберите даты' : 'Выберите дату'}
              </Label>
                           {isMultiSelectMode ? (
               <CalendarComponent
                 mode="multiple"
                 selected={selectedDates}
                 onSelect={setSelectedDates}
                 disabled={(date) => {
                   const today = new Date();
                   today.setHours(0, 0, 0, 0);
                   return date < today;
                 }}
                 className="rounded-md border"
               />
             ) : (
               <CalendarComponent
                 mode="single"
                 selected={selectedDate}
                 onSelect={setSelectedDate}
                 disabled={(date) => {
                   const today = new Date();
                   today.setHours(0, 0, 0, 0);
                   return date < today;
                 }}
                 className="rounded-md border"
               />
             )}
            </div>

            {isWeekCopyMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Шаблон недели</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weekDays.map(day => {
                      const slots = weekTemplate[day.value] || [];
                      return (
                        <div key={day.value} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm font-medium">{day.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {slots.length} окон
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={handleApplyWeekTemplate}>
                      Применить на 4 недели
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsWeekCopyMode(false);
                        setWeekTemplate({});
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Временные слоты */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">
                {isMultiSelectMode 
                  ? `Временные окна (${selectedDates.length} дат)`
                  : selectedDate 
                    ? `Временные окна на ${selectedDate.toLocaleDateString('ru-RU')}`
                    : 'Временные окна'
                }
              </Label>
              {(selectedDate || selectedDates.length > 0) && (
                <Button size="sm" onClick={() => setIsAddSlotOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить окно
                </Button>
              )}
            </div>

            {isMultiSelectMode ? (
              // Показываем расписание для всех выбранных дат
              <div className="space-y-4">
                {selectedDates.map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const daySchedule = scheduleDays.find(day => day.date === dateStr);
                  
                  return (
                    <Card key={dateStr}>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {date.toLocaleDateString('ru-RU', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {daySchedule && daySchedule.timeSlots.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.timeSlots.map((slot) => (
                              <div key={slot.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <Badge className={getStatusColor(slot.status)}>
                                    {getStatusText(slot.status)}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingSlot(slot)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSlot(slot.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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
                  );
                })}
              </div>
            ) : selectedDate && selectedDaySchedule ? (
              <div className="space-y-2">
                {selectedDaySchedule.timeSlots.map((slot) => (
                  <Card key={slot.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <Badge className={getStatusColor(slot.status)}>
                          {getStatusText(slot.status)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSlot(slot)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {slot.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{slot.notes}</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Нет временных окон на эту дату</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddSlotOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первое окно
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Выберите дату для просмотра расписания</p>
              </div>
            )}
          </div>
        </div>

        {/* Модалка добавления временного окна */}
        <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Добавить временное окно
                {selectedDates.length > 0 && ` на ${selectedDates.length} ${selectedDates.length === 1 ? 'дату' : 'даты'}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Время начала</Label>
                  <Select value={newSlot.startTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, startTime: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Время окончания</Label>
                  <Select value={newSlot.endTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, endTime: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={newSlot.status} onValueChange={(value: any) => setNewSlot(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Свободно</SelectItem>
                    <SelectItem value="blocked">Заблокировано</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Заметки (необязательно)</Label>
                <Input
                  value={newSlot.notes}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Дополнительная информация..."
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddSlotOpen(false)} className="flex-1">
                  Отмена
                </Button>
                <Button onClick={handleAddSlot} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Модалка редактирования временного окна */}
        <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать временное окно</DialogTitle>
            </DialogHeader>
            {editingSlot && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Время начала</Label>
                    <Select value={editingSlot.startTime} onValueChange={(value) => setEditingSlot(prev => prev ? { ...prev, startTime: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Время окончания</Label>
                    <Select value={editingSlot.endTime} onValueChange={(value) => setEditingSlot(prev => prev ? { ...prev, endTime: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Статус</Label>
                  <Select value={editingSlot.status} onValueChange={(value: any) => setEditingSlot(prev => prev ? { ...prev, status: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Свободно</SelectItem>
                      <SelectItem value="booked">Забронировано</SelectItem>
                      <SelectItem value="blocked">Заблокировано</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Заметки</Label>
                  <Input
                    value={editingSlot.notes || ""}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="Дополнительная информация..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingSlot(null)} className="flex-1">
                    Отмена
                  </Button>
                  <Button 
                    onClick={() => editingSlot && handleUpdateSlot(editingSlot.id, editingSlot)} 
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleManager; 
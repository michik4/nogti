
import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface DateTimeSelectorProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  disableWeekends?: boolean;
}

/**
 * Компонент для выбора даты и времени записи
 * Используется в модальных окнах создания и бронирования
 */
const DateTimeSelector = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  disableWeekends = false
}: DateTimeSelectorProps) => {
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <Label className="text-base font-semibold">Выберите дату *</Label>
        <div className="mt-2">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (date < today) return true;
              if (disableWeekends && date.getDay() === 0) return true;
              return false;
            }}
            className="rounded-md border"
          />
        </div>
      </div>

      {/* Time Selection */}
      <div>
        <Label className="text-base font-semibold">Выберите время *</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeSelect(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelector;

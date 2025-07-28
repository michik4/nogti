import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MasterService } from "@/types/master.types";
import { toast } from "sonner";

interface AddServiceFormProps {
  onSubmit: (service: Partial<MasterService>) => Promise<void>;
  onCancel: () => void;
}

export const AddServiceForm = ({ onSubmit, onCancel }: AddServiceFormProps) => {
  const [formData, setFormData] = useState<Partial<MasterService>>({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Введите название услуги');
      return;
    }

    if (formData.price === undefined || formData.price < 0) {
      toast.error('Введите корректную стоимость');
      return;
    }

    if (formData.duration === undefined || formData.duration < 0) {
      toast.error('Введите корректную длительность');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка при создании услуги:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название услуги</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: Маникюр с покрытием"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Опишите услугу подробнее..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Стоимость (₽)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Длительность (мин)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Активна</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Создание...' : 'Создать услугу'}
        </Button>
      </div>
    </form>
  );
}; 
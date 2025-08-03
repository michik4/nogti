import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MasterServiceDesign } from "@/types/master.types";

interface EditServiceDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    customPrice?: number;
    additionalDuration?: number;
    notes?: string;
    isActive?: boolean;
  }) => void;
  serviceDesign: MasterServiceDesign;
  serviceName: string;
  baseServicePrice: number;
}

const EditServiceDesignModal = ({
  isOpen,
  onClose,
  onSave,
  serviceDesign,
  serviceName,
  baseServicePrice
}: EditServiceDesignModalProps) => {
  const [formData, setFormData] = useState({
    customPrice: serviceDesign.customPrice || baseServicePrice,
    additionalDuration: serviceDesign.additionalDuration || 0,
    notes: serviceDesign.notes || '',
    isActive: serviceDesign.isActive
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        customPrice: serviceDesign.customPrice || baseServicePrice,
        additionalDuration: serviceDesign.additionalDuration || 0,
        notes: serviceDesign.notes || '',
        isActive: serviceDesign.isActive
      });
    }
  }, [isOpen, serviceDesign, baseServicePrice]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.customPrice < 0) {
      toast.error('Цена не может быть отрицательной');
      return;
    }

    if (formData.additionalDuration < 0) {
      toast.error('Дополнительное время не может быть отрицательным');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить изменения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Редактировать дизайн</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Превью дизайна */}
          <div className="flex items-start gap-4">
            <img 
              src={serviceDesign.nailDesign.image} 
              alt={serviceDesign.nailDesign.title}
              className="w-20 h-20 object-cover rounded border"
            />
            <div className="flex-1">
              <h4 className="font-medium">{serviceDesign.nailDesign.title}</h4>
              <p className="text-sm text-muted-foreground">
                Услуга: {serviceName}
              </p>
              <p className="text-xs text-muted-foreground">
                Базовая цена услуги: {baseServicePrice}₽
              </p>
            </div>
          </div>

          {/* Цена */}
          <div className="space-y-2">
            <Label htmlFor="customPrice">Цена дизайна (₽)</Label>
            <Input
              id="customPrice"
              type="number"
              min="0"
              step="50"
              value={formData.customPrice}
              onChange={(e) => handleInputChange('customPrice', Number(e.target.value))}
              placeholder={baseServicePrice.toString()}
            />
            <p className="text-xs text-muted-foreground">
              {formData.customPrice === baseServicePrice 
                ? 'Введите цену доплаты за дизайн'
                : `${formData.customPrice > baseServicePrice ? 'Доплата' : 'Скидка'}: ${Math.abs(formData.customPrice - baseServicePrice)}₽`
              }
            </p>
          </div>

          {/* Дополнительное время */}
          <div className="space-y-2">
            <Label htmlFor="additionalDuration">Дополнительное время (мин)</Label>
            <Input
              id="additionalDuration"
              type="number"
              min="0"
              step="5"
              value={formData.additionalDuration}
              onChange={(e) => handleInputChange('additionalDuration', Number(e.target.value))}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Время сверх базового времени услуги
            </p>
          </div>

          {/* Заметки */}
          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              placeholder="Особенности выполнения дизайна..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Активность */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Активен</Label>
              <p className="text-sm text-muted-foreground">
                Доступен для записи клиентами
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServiceDesignModal; 
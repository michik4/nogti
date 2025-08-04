import { useState } from "react";
import { X, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getImageUrl } from "@/utils/image.util";
import { formatPrice } from "@/utils/format.util";
import { toast } from "sonner";

interface AddDesignToServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (design: any, settings: {
    additionalPrice: number;
    additionalDuration: number;
    notes: string;
    isActive: boolean;
  }) => void;
  design: any;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
}

const AddDesignToServiceModal = ({
  isOpen,
  onClose,
  onConfirm,
  design,
  serviceName,
  servicePrice,
  serviceDuration
}: AddDesignToServiceModalProps) => {
  const [settings, setSettings] = useState({
    additionalPrice: 0, // Дополнительная стоимость дизайна
    additionalDuration: 0,
    notes: '',
    isActive: true
  });

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    if (settings.additionalPrice < 0) {
      toast.error('Дополнительная стоимость не может быть отрицательной');
      return;
    }

    if (settings.additionalDuration < 0) {
      toast.error('Дополнительное время не может быть отрицательным');
      return;
    }

    onConfirm(design, settings);
    onClose();
  };

  const calculateTotalPrice = () => {
    return servicePrice + settings.additionalPrice;
  };

  const calculateTotalDuration = () => {
    return serviceDuration + settings.additionalDuration;
  };

  const getPriceDifference = () => {
    if (settings.additionalPrice === 0) return 'Без доплаты';
    if (settings.additionalPrice > 0) return `+${formatPrice(settings.additionalPrice)}`;
    return `${formatPrice(settings.additionalPrice)}`;
  };

  const getDurationDifference = () => {
    if (settings.additionalDuration === 0) return 'Без доп. времени';
    if (settings.additionalDuration > 0) return `+${settings.additionalDuration} мин`;
    return `${settings.additionalDuration} мин`;
  };

  if (!design) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Настройка дизайна для услуги "{serviceName}"</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о дизайне */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img
                  src={getImageUrl(design.imageUrl)}
                  alt={design.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{design.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {design.description || 'Описание отсутствует'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {design.type === 'basic' ? 'Базовый' : 'Дизайнерский'}
                    </Badge>
                    {design.color && (
                      <Badge variant="outline">
                        Цвет: {design.color}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Настройки цены */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Настройка цены</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                   <Label htmlFor="additionalPrice">Дополнительная стоимость дизайна (₽)</Label>
                   <Input
                     id="additionalPrice"
                     type="number"
                     min="0"
                     step="50"
                     value={settings.additionalPrice}
                     onChange={(e) => handleInputChange('additionalPrice', Number(e.target.value))}
                     placeholder="0"
                   />
                   <p className="text-xs text-muted-foreground">
                     {getPriceDifference()}
                   </p>
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalDuration">Дополнительное время (мин)</Label>
                  <Input
                    id="additionalDuration"
                    type="number"
                    min="0"
                    step="5"
                    value={settings.additionalDuration}
                    onChange={(e) => handleInputChange('additionalDuration', Number(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getDurationDifference()}
                  </p>
                </div>
              </div>

                             <div className="bg-muted p-3 rounded-lg">
                 <div className="flex items-center justify-between text-sm">
                   <span>Базовая стоимость услуги:</span>
                   <span className="text-muted-foreground">{formatPrice(servicePrice)}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span>Доплата за дизайн:</span>
                   <span className={settings.additionalPrice > 0 ? "text-green-600" : "text-muted-foreground"}>
                     {settings.additionalPrice > 0 ? `+${formatPrice(settings.additionalPrice)}` : "Без доплаты"}
                   </span>
                 </div>
                 <div className="flex items-center justify-between text-sm font-semibold border-t pt-2 mt-2">
                   <span>Итоговая стоимость:</span>
                   <span className="font-semibold text-lg text-primary">
                     {formatPrice(calculateTotalPrice())}
                   </span>
                 </div>
                 <div className="flex items-center justify-between text-sm text-muted-foreground">
                   <span>Общее время:</span>
                   <span>{calculateTotalDuration()} мин</span>
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Дополнительные настройки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Дополнительные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Заметки (необязательно)</Label>
                <Textarea
                  id="notes"
                  placeholder="Дополнительная информация о дизайне..."
                  value={settings.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isActive">Активен</Label>
                  <p className="text-xs text-muted-foreground">
                    Дизайн будет доступен для клиентов
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={settings.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Информационная панель */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Как работает ценообразование</h4>
                                     <ul className="text-sm text-blue-800 space-y-1">
                     <li>• <strong>Дополнительная стоимость</strong> - доплата к базовой цене услуги за этот дизайн</li>
                     <li>• <strong>Дополнительное время</strong> - время сверх базового времени услуги</li>
                     <li>• <strong>Заметки</strong> - внутренняя информация для вас</li>
                     <li>• <strong>Активность</strong> - определяет, видят ли клиенты этот дизайн</li>
                   </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Действия */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirm}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить дизайн
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDesignToServiceModal; 
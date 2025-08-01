import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Info } from "lucide-react";
import { masterService } from "@/services/masterService";
import { MasterServiceDesign } from "@/types/master.types";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/image.util";

interface DesignSelectorProps {
  serviceId: string;
  selectedDesignId?: string;
  onDesignSelect: (design: MasterServiceDesign | null) => void;
}

/**
 * Компонент для выбора дизайна из списка доступных
 * Используется в модальном окне создания записи мастером
 */
const DesignSelector = ({ serviceId, selectedDesignId, onDesignSelect }: DesignSelectorProps) => {
  const [designs, setDesigns] = useState<MasterServiceDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const preselectedProcessedRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const serviceDesigns = await masterService.getServiceDesigns(serviceId);
        setDesigns(serviceDesigns);
        
        // Если есть предвыбранный дизайн и он еще не был обработан, найдем его в загруженных и установим
        if (selectedDesignId && preselectedProcessedRef.current !== selectedDesignId) {
          const preselectedDesign = serviceDesigns.find(
            design => design.nailDesign.id === selectedDesignId
          );
          if (preselectedDesign) {
            onDesignSelect(preselectedDesign);
            preselectedProcessedRef.current = selectedDesignId;
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки дизайнов услуги:', error);
        toast.error('Не удалось загрузить дизайны для этой услуги');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchDesigns();
    }
  }, [serviceId, selectedDesignId]);

  // Сбрасываем ref когда selectedDesignId изменяется на null или undefined
  useEffect(() => {
    if (!selectedDesignId) {
      preselectedProcessedRef.current = null;
    }
  }, [selectedDesignId]);

  const handleDesignSelect = (design: MasterServiceDesign) => {
    if (selectedDesignId === design.nailDesign.id) {
      onDesignSelect(null); // Снимаем выбор
    } else {
      onDesignSelect(design);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Выберите дизайн (необязательно)</h3>
        <div className="grid grid-cols-2 gap-3">
          {Array(4).fill(0).map((_, index) => (
            <Card key={index} className="p-3 animate-pulse">
              <Skeleton className="w-full h-24 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Выберите дизайн (необязательно)</h3>
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <h4 className="text-lg font-semibold">Пока нет дизайнов</h4>
            <p className="text-sm text-muted-foreground">
              Мастер пока не добавил дизайны к этой услуге
            </p>
            <p className="text-xs text-muted-foreground">
              Вы можете записаться без выбора конкретного дизайна
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Выберите дизайн (необязательно)</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDesignSelect(null)}
          disabled={!selectedDesignId}
        >
          Без дизайна
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {designs.map((serviceDesign) => {
          const isSelected = selectedDesignId === serviceDesign.nailDesign.id;
          const hasCustomPrice = serviceDesign.customPrice && serviceDesign.customPrice > 0;
          const hasAdditionalDuration = serviceDesign.additionalDuration && serviceDesign.additionalDuration > 0;
          
          return (
            <Card 
              key={serviceDesign.nailDesign.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleDesignSelect(serviceDesign)}
            >
              <div className="p-3">
                <div className="aspect-square relative overflow-hidden rounded-md mb-2">
                  <img 
                    src={getImageUrl(serviceDesign.nailDesign.imageUrl)} 
                    alt={serviceDesign.nailDesign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h4 className="font-medium text-sm mb-1 line-clamp-1">
                  {serviceDesign.nailDesign.title}
                </h4>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {serviceDesign.nailDesign.type === "basic" ? "Базовый" : "Дизайнерский"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Дизайн
                  </span>
                </div>

                {/* Дополнительная стоимость мастера */}
                {hasCustomPrice && (
                  <div className="flex items-center gap-1 mb-1">
                    <Info className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">
                      +{formatPrice(serviceDesign.customPrice)} от мастера
                    </span>
                  </div>
                )}

                {/* Дополнительное время */}
                {hasAdditionalDuration && (
                  <div className="flex items-center gap-1 mb-1">
                    <Info className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      +{serviceDesign.additionalDuration} мин
                    </span>
                  </div>
                )}

                {/* Примечания мастера */}
                {serviceDesign.notes && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {serviceDesign.notes}
                  </p>
                )}

                {/* Информация о том, что дизайн бесплатный */}
                {!hasCustomPrice && !hasAdditionalDuration && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700 dark:text-green-300">
                        Дизайн включен в стоимость услуги
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      {selectedDesignId && (
        <div className="text-sm text-muted-foreground">
          Выбран дизайн: {designs.find(d => d.nailDesign.id === selectedDesignId)?.nailDesign.title}
        </div>
      )}

      {/* Информация о системе ценообразования */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Как работает выбор дизайна:</p>
            <ul className="space-y-1">
              <li>• Дизайн - это визуальный пример того, что может выполнить мастер</li>
              <li>• Мастер может установить дополнительную стоимость за сложные дизайны</li>
              <li>• Время выполнения может увеличиться для сложных дизайнов</li>
              <li>• Итоговая стоимость будет показана после выбора дизайна</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSelector;

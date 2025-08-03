import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { masterService } from "@/services/masterService";
import { MasterServiceDesign } from "@/types/master.types";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/image.util";
import { roundPrice, formatPrice } from "@/utils/format.util";

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
        <div className="text-center py-8 text-muted-foreground">
          <p>Мастер пока не добавил дизайны к этой услуге</p>
          <p className="text-sm">Вы можете записаться без выбора конкретного дизайна</p>
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
      
      <div className="space-y-2 max-h-48 overflow-y-auto px-1">
        {designs.map((serviceDesign) => {
          const isSelected = selectedDesignId === serviceDesign.nailDesign.id;
          
          return (
            <Card 
              key={serviceDesign.nailDesign.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleDesignSelect(serviceDesign)}
            >
              <div className="p-3 flex items-center gap-3">
                {/* Маленькое изображение */}
                <div className="w-12 h-12 relative overflow-hidden rounded-md flex-shrink-0">
                  <img 
                    src={getImageUrl(serviceDesign.nailDesign.imageUrl)} 
                    alt={serviceDesign.nailDesign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Информация о дизайне */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">
                    {serviceDesign.nailDesign.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {serviceDesign.nailDesign.type === "basic" ? "Базовый" : "Дизайнерский"}
                    </Badge>
                    
                  </div>

                  {/* Дополнительная информация */}
                  <div className="flex items-center gap-2 mt-1">
                    {serviceDesign.customPrice && (
                      <span className="text-xs text-primary font-medium">
                        +{formatPrice(serviceDesign.customPrice)}
                      </span>
                    )}
                    {serviceDesign.additionalDuration !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        +{serviceDesign.additionalDuration} мин
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Индикатор выбора */}
                <div className="flex-shrink-0">
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Примечания, если есть */}
              {serviceDesign.notes && (
                <div className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {serviceDesign.notes}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {selectedDesignId && (
        <div className="text-sm text-muted-foreground">
          Выбран дизайн: {designs.find(d => d.nailDesign.id === selectedDesignId)?.nailDesign.title}
        </div>
      )}
    </div>
  );
};

export default DesignSelector;

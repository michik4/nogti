import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { MasterServiceDesign } from "@/types/master.types";
import { masterService } from "@/services/masterService";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/utils/image.util";
import { roundPrice } from "@/utils/format.util";

interface ServiceDesignsProps {
  serviceId: string;
  serviceName: string;
  onDesignClick?: (design: MasterServiceDesign) => void;
}

const ServiceDesigns = ({ serviceId, serviceName, onDesignClick }: ServiceDesignsProps) => {
  const [designs, setDesigns] = useState<MasterServiceDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchServiceDesigns = async () => {
      try {
        const serviceDesigns = await masterService.getServiceDesigns(serviceId);
        setDesigns(serviceDesigns.filter(design => design.isActive));
      } catch (error) {
        console.error('Ошибка загрузки дизайнов услуги:', error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDesigns();
    }
  }, [serviceId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        {Array(4).fill(0).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm mt-3 py-4 border border-dashed rounded-lg">
        Дизайны для этой услуги не добавлены
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-muted-foreground">
          Доступные дизайны ({designs.length})
        </h5>
        {designs.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Скрыть
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Показать 
              </>
            )}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-2 gap-3">
          {designs.map((serviceDesign) => (
            <Card
              key={serviceDesign.id}
              className="p-3 cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => onDesignClick?.(serviceDesign)}
            >
              <div className="aspect-square relative overflow-hidden rounded-lg mb-2">
                <img
                  src={getImageUrl(serviceDesign.nailDesign.imageUrl) || '/placeholder.svg'}
                  alt={serviceDesign.nailDesign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4 text-white drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white drop-shadow-lg">
                  <Heart className="w-3 h-3 fill-white" />
                  <span className="text-xs">{serviceDesign.nailDesign.likesCount}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h6 className="text-sm font-medium line-clamp-2">
                  {serviceDesign.nailDesign.title}
                </h6>
                
                <div className="flex items-center justify-between">
                  
                  
                  <span className="text-sm font-semibold text-primary">
                    {serviceDesign.customPrice ? `+${roundPrice(serviceDesign.customPrice)}₽` : 'В цене услуги'}
                  </span>
                </div>
                
                {serviceDesign.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {serviceDesign.notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceDesigns; 
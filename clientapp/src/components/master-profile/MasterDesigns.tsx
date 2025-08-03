import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Plus, CheckCircle } from "lucide-react";
import { designService, NailDesign } from "@/services/designService";
import { masterService } from "@/services/masterService";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/image.util";
import { roundPrice } from "@/utils/format.util";

interface MasterDesignsProps {
  masterId: string;
  onDesignClick?: (design: NailDesign) => void;
}

const MasterDesigns = ({ masterId, onDesignClick }: MasterDesignsProps) => {
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMasterDesigns = async () => {
      try {
        // Получаем дизайны из списка "Я так могу"
        const canDoDesigns = await masterService.getAllMasterDesigns(masterId).catch(error => {
          console.error('Ошибка загрузки дизайнов:', error);
          return [];
        });
        
        // Фильтруем только активные дизайны
        const activeDesigns = canDoDesigns.filter((design: NailDesign) => 
          design.isActive && design.isModerated
        );
        
        setDesigns(activeDesigns);
      } catch (error) {
        console.error('Ошибка загрузки дизайнов мастера:', error);
      } finally {
        setLoading(false);
      }
    };

    if (masterId) {
      fetchMasterDesigns();
    }
  }, [masterId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array(6).fill(0).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Мои дизайны</h3>
        <span className="text-muted-foreground">{designs.length} дизайнов</span>
      </div>
      
      {designs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Пока нет дизайнов</h4>
          <p className="text-muted-foreground text-sm">
            Здесь будут отображаться дизайны из списка "Я так могу"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {designs.map((design) => (
            <div
              key={design.id}
              className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => navigate(`/designs/${design.id}`)}
            >
              <img
                src={getImageUrl(design.imageUrl) || '/placeholder.svg'}
                alt={design.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Overlay с информацией */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3">
                  <h6 className="text-white font-medium text-sm line-clamp-2 mb-2">
                    {design.title}
                  </h6>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={design.type === 'designer' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {design.type === 'designer' ? 'Дизайнерский' : 'Базовый'}
                    </Badge>
                    <div className="flex items-center gap-2 text-white text-xs">
                      
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-white" />
                        <span>{design.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{design.ordersCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Тип дизайна в углу - скрывается при наведении */}
              <div className="absolute top-2 right-2 group-hover:opacity-0 transition-opacity">
                <Badge 
                  variant={design.type === 'designer' ? 'default' : 'secondary'}
                  className="text-xs shadow-lg"
                >
                  {design.type === 'designer' ? 'Дизайнерский' : 'Базовый'}
                </Badge>
              </div>
              
              
              
              {/* Лайки в левом нижнем углу - скрываются при наведении */}
              <div className="absolute bottom-2 left-2 group-hover:opacity-0 transition-opacity">
                <div className="flex items-center gap-1 text-white drop-shadow-lg">
                  <Heart className="w-3 h-3 fill-white" />
                  <span className="text-xs">{design.likesCount}</span>
                </div>
              </div>

              

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MasterDesigns; 
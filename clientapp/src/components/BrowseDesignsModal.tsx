import { useState, useEffect } from "react";
import { X, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { masterService } from "@/services/masterService";
import { getImageUrl } from "@/utils/image.util";
import { toast } from "sonner";
import { roundPrice } from "@/utils/format.util";
import { useNavigate } from "react-router-dom";

interface BrowseDesignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesign: (design: any) => void; // Изменяем тип на any, так как это MasterDesign
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  masterId?: string; // Добавляем ID мастера
}

const BrowseDesignsModal = ({ 
  isOpen, 
  onClose, 
  onSelectDesign, 
  serviceId, 
  serviceName, 
  servicePrice,
  masterId 
}: BrowseDesignsModalProps) => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchDesigns();
    }
  }, [isOpen]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      
      if (!masterId) {
        console.error('ID мастера не найден');
        toast.error('Ошибка: ID мастера не найден');
        setDesigns([]);
        return;
      }
      
      // Используем getAllMasterDesigns для получения всех дизайнов мастера
      const response = await masterService.getAllMasterDesigns(masterId);

      if (response && Array.isArray(response)) {
        // Преобразуем ответ в формат MasterDesign для совместимости
        const masterDesigns = response.map((design: any) => ({
          id: design.id,
          nailDesign: design,
          isActive: design.isActive !== false,
          customPrice: design.minPrice || 0,
          estimatedDuration: 60,
          addedAt: design.createdAt || new Date().toISOString()
        }));
        setDesigns(masterDesigns);
      } else {
        setDesigns([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки дизайнов:', error);
      toast.error('Не удалось загрузить ваши дизайны');
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDesign = (masterDesign: any) => {
    // Передаем nailDesign из masterDesign
    onSelectDesign(masterDesign.nailDesign);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Выбрать дизайн для услуги "{serviceName}"</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Список дизайнов */}
        <div className="flex-1 overflow-y-auto">
          {loading && designs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, index) => (
                <Card key={index} className="p-4 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : designs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map((masterDesign) => {
                const design = masterDesign.nailDesign;
                return (
                  <Card key={masterDesign.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="aspect-square relative overflow-hidden rounded-lg mb-3">
                      <img 
                        src={getImageUrl(design.imageUrl) || '/placeholder.svg'} 
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSelectDesign(masterDesign)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Добавить
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{design.title}</h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={design.type === 'designer' ? 'default' : 'secondary'} className="text-xs">
                            {design.type === 'designer' ? 'Дизайнерский' : 'Базовый'}
                          </Badge>
                          {design.uploadedByMaster?.id ? (
                            <Badge variant="default" className="text-xs">
                              Создан мной
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Добавлен
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          ❤️ {design.likesCount} 📋 {design.ordersCount}
                        </span>
                        
                      </div>
                      
                      
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">У вас пока нет дизайнов</p>
              <p className="text-sm text-muted-foreground mt-2">
                Создайте дизайны или добавьте существующие в список "Я так могу"
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/designs')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Перейти к дизайнам
              </Button>
            </div>
          )}
        </div>

        
      </DialogContent>
    </Dialog>
  );
};

export default BrowseDesignsModal; 
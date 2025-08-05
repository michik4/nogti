import { useState, useEffect } from "react";
import { X, Palette, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { masterService } from "@/services/masterService";
import { MasterServiceDesign } from "@/types/master.types";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/image.util";
import { roundPrice } from "@/utils/format.util";

interface DesignSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  selectedDesign: MasterServiceDesign | null;
  onDesignSelect: (design: MasterServiceDesign | null) => void;
  preselectedDesignId?: string;
}

/**
 * Модальное окно для выбора дизайна
 * Предоставляет удобный интерфейс для выбора дизайна из списка
 */
const DesignSelectionModal = ({
  isOpen,
  onClose,
  serviceId,
  selectedDesign,
  onDesignSelect,
  preselectedDesignId
}: DesignSelectionModalProps) => {
  const [designs, setDesigns] = useState<MasterServiceDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<'all' | 'basic' | 'designer'>('all');

  useEffect(() => {
    const fetchDesigns = async () => {
      if (!isOpen || !serviceId) return;
      
      try {
        setLoading(true);
        const serviceDesigns = await masterService.getServiceDesigns(serviceId);
        setDesigns(serviceDesigns);
        
        // Если есть предвыбранный дизайн, найдем его в загруженных
        if (preselectedDesignId) {
          const preselectedDesign = serviceDesigns.find(
            design => design.nailDesign.id === preselectedDesignId
          );
          if (preselectedDesign) {
            onDesignSelect(preselectedDesign);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки дизайнов:', error);
        toast.error('Не удалось загрузить дизайны');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [isOpen, serviceId, preselectedDesignId]);

  // Фильтрация дизайнов
  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.nailDesign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || design.nailDesign.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDesignSelect = (design: MasterServiceDesign) => {
    if (selectedDesign?.nailDesign.id === design.nailDesign.id) {
      onDesignSelect(null); // Отменяем выбор
    } else {
      onDesignSelect(design);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedType('all');
    onClose();
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Выберите дизайн
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Фильтры */}
          <div className="flex gap-4 mb-4 p-4 bg-muted rounded-lg">
            {/* Поиск */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск дизайнов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            {/* Фильтр по типу */}
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                Все
              </Button>
              <Button
                variant={selectedType === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('basic')}
              >
                Базовые
              </Button>
              <Button
                variant={selectedType === 'designer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('designer')}
              >
                Дизайнерские
              </Button>
            </div>
          </div>

                     {/* Список дизайнов */}
           <div className="flex-1 overflow-y-auto p-4">
             {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-4">
                      <Skeleton className="w-full h-32 mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDesigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDesigns.map((design) => {
                  const isSelected = selectedDesign?.nailDesign.id === design.nailDesign.id;
                  
                  return (
                    <Card
                      key={design.nailDesign.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleDesignSelect(design)}
                    >
                      <CardContent className="p-4">
                        {/* Изображение */}
                        <div className="relative mb-3">
                          <img
                            src={getImageUrl(design.nailDesign.imageUrl)}
                            alt={design.nailDesign.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Информация */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {design.nailDesign.title}
                          </h4>

                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {design.nailDesign.type === "basic" ? "Базовый" : "Дизайнерский"}
                            </Badge>
                          </div>

                          {/* Цена и время */}
                          <div className="flex items-center justify-between text-sm">
                            {design.customPrice && design.customPrice > 0 ? (
                              <span className="font-medium text-primary">
                                +{roundPrice(design.customPrice)}₽
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Бесплатно</span>
                            )}
                            
                            {design.additionalDuration && design.additionalDuration > 0 ? (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">+{design.additionalDuration} мин</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">Время услуги</span>
                              </div>
                            )}
                          </div>

                          {/* Примечания */}
                          {design.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {design.notes}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Дизайны не найдены по заданным критериям'
                    : 'Мастер пока не добавил дизайны к этой услуге'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Вы можете записаться без выбора конкретного дизайна
                </p>
              </div>
            )}
          </div>

          {/* Выбранный дизайн */}
          {selectedDesign && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(selectedDesign.nailDesign.imageUrl)}
                    alt={selectedDesign.nailDesign.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-medium">{selectedDesign.nailDesign.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDesign.customPrice && selectedDesign.customPrice > 0 ? `+${roundPrice(selectedDesign.customPrice)}₽` : 'Бесплатно'}
                      {selectedDesign.additionalDuration && selectedDesign.additionalDuration > 0 ? 
                        ` • +${selectedDesign.additionalDuration} мин`
                      : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">Время услуги</span>
                        </div>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDesignSelect(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Подтвердить выбор
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignSelectionModal; 
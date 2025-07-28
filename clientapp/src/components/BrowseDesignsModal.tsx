import { useState, useEffect } from "react";
import { Search, Filter, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { designService, NailDesign, GetDesignsParams } from "@/services/designService";
import { getImageUrl } from "@/utils/image.util";
import { toast } from "sonner";

interface BrowseDesignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesign: (design: NailDesign) => void;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
}

const BrowseDesignsModal = ({ 
  isOpen, 
  onClose, 
  onSelectDesign, 
  serviceId, 
  serviceName, 
  servicePrice 
}: BrowseDesignsModalProps) => {
  const [designs, setDesigns] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<GetDesignsParams>({
    page: 1,
    limit: 12,
    type: undefined,
    source: undefined,
    includeOwn: true // Показываем свои дизайны мастеру
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchDesigns();
    }
  }, [isOpen, filters, searchQuery]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      
      let response;
      if (searchQuery.trim()) {
        response = await designService.searchDesigns(searchQuery, filters);
      } else {
        response = await designService.getAllDesigns(filters);
      }

      if (response.success && response.data) {
        setDesigns(response.data || []);
        setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Ошибка загрузки дизайнов:', error);
      toast.error('Не удалось загрузить дизайны');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof GetDesignsParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectDesign = (design: NailDesign) => {
    onSelectDesign(design);
    onClose();
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: prev.page! + 1 }));
    }
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

        {/* Поиск и фильтры */}
        <div className="space-y-4 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск дизайнов..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Тип дизайна" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="basic">Базовый</SelectItem>
                <SelectItem value="designer">Дизайнерский</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.source || "all"}
              onValueChange={(value) => handleFilterChange('source', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Источник" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все источники</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="client">Клиенты</SelectItem>
                <SelectItem value="master">Мастера</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
              {designs.map((design) => (
                <Card key={design.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
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
                        onClick={() => handleSelectDesign(design)}
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
                        <Badge variant="outline" className="text-xs">
                          {design.source === 'admin' ? 'Админ' : design.source === 'client' ? 'Клиент' : 'Мастер'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ❤️ {design.likesCount} 📋 {design.ordersCount}
                      </span>
                      <span className="font-semibold text-primary">
                        {design.estimatedPrice ? `${design.estimatedPrice}₽` : `${servicePrice}₽`}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Дизайны не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}

          {/* Кнопка "Загрузить еще" */}
          {pagination.page < pagination.totalPages && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Загрузить еще'}
              </Button>
            </div>
          )}
        </div>

        {/* Информация о ценообразовании */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Ценообразование:</strong> Если у дизайна нет указанной цены, будет использована цена услуги ({servicePrice}₽). 
            Вы сможете установить индивидуальную цену после добавления.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrowseDesignsModal; 
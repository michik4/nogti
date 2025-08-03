
import { useState } from "react";
import { X, Grid, List, Star, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockMasters } from "@/data/mockMasters";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utils/format.util";

interface MastersCatalogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Каталог всех мастеров для мобильной версии
 * Показывает список или сетку мастеров с фильтрацией
 */
export const MastersCatalog = ({ isOpen, onClose }: MastersCatalogProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories = [
    "Все мастера",
    "Гель-лак", 
    "Дизайн",
    "Маникюр",
    "Педикюр",
    "3D дизайн"
  ];

  const filteredMasters = selectedCategory && selectedCategory !== "Все мастера"
    ? mockMasters.filter(master => 
        master.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )
    : mockMasters;

  const handleMasterSelect = (masterId: string) => {
    console.log('Master selected:', masterId);
    navigate("/auth");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full bg-background p-0">
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
            <SheetTitle>Каталог мастеров</SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Категории */}
          <div className="p-4 border-b">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Список мастеров */}
          <div className="flex-1 overflow-y-auto p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredMasters.map((master) => (
                  <Card 
                    key={master.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleMasterSelect(master.id)}
                  >
                    <div className="aspect-square relative">
                      <img 
                        src={master.image} 
                        alt={master.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <h3 className="font-semibold text-sm truncate">{master.name}</h3>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{master.rating}</span>
                        </div>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
                        {formatPrice(master.price || 0)}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMasters.map((master) => (
                  <Card 
                    key={master.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleMasterSelect(master.id)}
                  >
                    <div className="flex gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={master.avatar} />
                        <AvatarFallback>{master.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold truncate">{master.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {master.location}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{master.rating}</span>
                            </div>
                            <div className="text-sm font-semibold">{formatPrice(master.price || 0)}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {master.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Счетчик результатов */}
          <div className="p-4 border-t bg-background">
            <p className="text-sm text-muted-foreground text-center">
              Найдено мастеров: {filteredMasters.length}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};


import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно поиска для мобильной версии
 * Включает строку поиска, фильтры и результаты поиска
 */
export const SearchSheet = ({ isOpen, onClose }: SearchSheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const navigate = useNavigate();

  // Популярные поисковые запросы
  const popularSearches = [
    "Гель-лак",
    "Френч",
    "Дизайн ногтей", 
    "Маникюр",
    "Педикюр",
    "3D дизайн"
  ];

  // Категории фильтров
  const filterCategories = [
    { name: "Услуги", options: ["Маникюр", "Педикюр", "Покрытие", "Дизайн"] },
    { name: "Цена", options: ["До 1000₽", "1000-2000₽", "2000-3000₽", "3000₽+"] },
    { name: "Район", options: ["Центр", "Север", "Юг", "Восток", "Запад"] }
  ];

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSearch = () => {
    console.log('Search:', searchQuery, 'Filters:', selectedFilters);
    navigate("/auth");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="h-full bg-background">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle>Поиск мастеров</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </SheetHeader>

        <div className="space-y-6">
          {/* Строка поиска */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Найти мастера или услугу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Популярные запросы */}
          <div>
            <h3 className="font-semibold mb-3">Популярные запросы</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Badge
                  key={search}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>

          {/* Фильтры */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Фильтры</h3>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Сбросить
              </Button>
            </div>

            {filterCategories.map((category) => (
              <div key={category.name} className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((option) => (
                    <Badge
                      key={option}
                      variant={selectedFilters.includes(option) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Недавние поиски */}
          <div>
            <h3 className="font-semibold mb-3">Недавние поиски</h3>
            <div className="space-y-2">
              {["Френч с дизайном", "Маникюр Центр"].map((recent) => (
                <Card
                  key={recent}
                  className="p-3 cursor-pointer hover:bg-accent"
                  onClick={() => setSearchQuery(recent)}
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span>{recent}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Кнопка поиска */}
          <Button 
            className="w-full gradient-bg text-white py-3 text-lg rounded-full"
            onClick={handleSearch}
          >
            Найти мастеров
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

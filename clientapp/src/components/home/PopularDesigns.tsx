import { Heart, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { designService } from "@/services/designService";
import { Design, NailDesignType } from "@/types/design.types";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "../../utils/image.util";
import { roundPrice, formatPrice } from "@/utils/format.util";

/**
 * Секция с популярными дизайнами
 * Отображает сетку трендовых дизайнов ногтей с современным дизайном
 */
const PopularDesigns = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<NailDesignType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await designService.getPopularDesigns();
        if (response.success && response.data) {
          setDesigns(response.data as NailDesignType[]);
        } else {
          setError(response.error || "Не удалось загрузить дизайны");
        }
      } catch (err) {
        setError("Произошла ошибка при загрузке дизайнов");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-500 py-6">
        {error}
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
            Трендовые дизайны
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Вдохновляйтесь последними трендами и выбирайте уникальные дизайны для своего маникюра
          </p>
        </div>

        {/* Сетка дизайнов */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            // Скелетон для загрузки
            Array(8).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden group">
                <div className="aspect-square relative">
                  <Skeleton className="w-full h-full" />
                </div>
              </Card>
            ))
          ) : (
            designs.map((design) => (
              <Card 
                key={design.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md hover:scale-105"
                onClick={() => navigate(`/designs/${design.id}`)}
              >
                <div className="aspect-square relative overflow-hidden">
                  {/* Изображение дизайна */}
                  <img 
                    src={getImageUrl(design.imageUrl) || "/placeholder.svg"} 
                    alt={design.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Градиентный оверлей */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Информация о дизайне */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm mb-2">{design.title}</h3>
                    <div className="flex items-center justify-between text-xs">
                      <span className="opacity-90">{design.source || "Мастер"}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{design.likesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ценник */}
                  {design.estimatedPrice && (
                    <Badge className="absolute top-3 right-3 bg-black/80 text-white text-xs backdrop-blur-sm">
                      {formatPrice(design.estimatedPrice)}
                    </Badge>
                  )}
                  
                  {/* Бейдж "Популярный" для дизайнов с высоким рейтингом */}
                  {(design.likesCount || 0) > 50 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Популярный
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate("/designs")}
            className="px-8 py-3 text-base font-medium hover:bg-pink-50 dark:hover:bg-pink-950/20"
          >
            Смотреть все дизайны
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDesigns;

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { designService } from "@/services/designService";
import { Design, NailDesignType } from "@/types/design.types";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "../../utils/image.util";

/**
 * Секция с популярными дизайнами
 * Отображает сетку трендовых дизайнов ногтей
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
    <section className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Популярные дизайны</h2>
        <Button variant="ghost" onClick={() => navigate("/designs")}>
          Смотреть все
        </Button>
      </div>

      {/* Сетка дизайнов */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          // Скелетон для загрузки
          Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square">
                <Skeleton className="w-full h-full" />
              </div>
            </Card>
          ))
        ) : (
          designs.map((design) => (
            <Card 
              key={design.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/designs/${design.id}`)}
            >
              <div className="aspect-square relative">
                {/* Изображение дизайна */}
                <img 
                  src={getImageUrl(design.imageUrl) || "/placeholder.svg"} 
                  alt={design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Градиентный оверлей */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Информация о дизайне */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-semibold text-sm mb-1">{design.title}</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span>{design.source || "Мастер"}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {design.likesCount || 0}
                    </div>
                  </div>
                </div>
                
                {/* Ценник */}
                <Badge className="absolute top-3 right-3 bg-black/70 text-white text-xs">
                  {design.minPrice ? `от ${design.minPrice}₽` : "Нет услуг"}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

export default PopularDesigns;

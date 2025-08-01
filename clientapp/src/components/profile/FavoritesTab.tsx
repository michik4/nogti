import { useState, useEffect } from "react";
import { Heart, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { designService, NailDesign } from "@/services/designService";
import { getImageUrl } from "@/utils/image.util";
import { useNavigate } from "react-router-dom";

interface FavoritesTabProps {
  onBookAgain: (designId: string) => void;
}

/**
 * Компонент вкладки с избранными дизайнами
 * Отображает сетку избранных дизайнов пользователя
 */
const FavoritesTab = ({ onBookAgain }: FavoritesTabProps) => {
  const [favorites, setFavorites] = useState<NailDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Загрузка понравившихся дизайнов
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated || isGuest()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await designService.getUserLikedDesigns({ limit: 20 });
        
        if (response.success && response.data) {
          setFavorites(response.data);
        } else {
          setError(response.error || 'Не удалось загрузить понравившиеся дизайны');
        }
      } catch (err) {
        console.error('Ошибка загрузки понравившихся дизайнов:', err);
        setError('Произошла ошибка при загрузке дизайнов');
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, isGuest]);

  // Обработчик удаления из избранного
  const handleRemoveFromFavorites = async (designId: string) => {
    if (!isAuthenticated || isGuest()) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы управлять избранными дизайнами",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await designService.toggleLike(designId);
      
      if (response.success) {
        // Удаляем дизайн из локального состояния
        setFavorites(prev => prev.filter(design => design.id !== designId));
        
        toast({
          title: "Удалено из избранного",
          description: "Дизайн удален из ваших избранных.",
        });
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось удалить дизайн из избранного",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении дизайна",
        variant: "destructive"
      });
    }
  };

  // Обработчик просмотра дизайна
  const handleViewDesign = (designId: string) => {
    navigate(`/designs/${designId}`);
  };

  // Обработчик просмотра всех избранных
  const handleViewAllFavorites = () => {
    // TODO: Можно добавить отдельную страницу для всех избранных
    toast({
      title: "Все избранные",
      description: "Показаны все избранные дизайны на этой странице",
    });
  };

  if (!isAuthenticated || isGuest()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Избранные дизайны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Войдите в систему, чтобы видеть понравившиеся дизайны
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Избранные дизайны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Загрузка избранных дизайнов...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Избранные дизайны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Избранные дизайны ({favorites.length})
          </div>
          {favorites.length > 4 && (
            <Button size="sm" variant="outline" onClick={handleViewAllFavorites}>
              Все избранные
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((design) => (
              <div key={design.id} className="relative group">
                {/* Изображение дизайна */}
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                                          src={getImageUrl(design.imageUrl) || '/placeholder.svg'} 
                    alt={design.title}
                    className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Оверлей с кнопками действий */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleViewDesign(design.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => onBookAgain(design.id)}
                      >
                        Записаться
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleRemoveFromFavorites(design.id)}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Информация о дизайне */}
                <div className="mt-2">
                  <h4 className="font-medium text-sm line-clamp-1">{design.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {design.type === 'designer' ? 'Дизайнерский' : 'Базовый'}
                  </p>
                  {design.minPrice && (
                    <p className="text-xs font-semibold text-primary">
                      от {design.minPrice} ₽
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-muted-foreground">
                      {design.likesCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              У вас пока нет избранных дизайнов
            </p>
            <Button onClick={() => navigate("/designs")} variant="outline">
              Найти дизайны
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoritesTab;

import { useState, useEffect } from "react";
import { Star, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { userService, ClientStats } from "@/services/userService";
import { formatCustomDate } from "@/utils/time.util";

/**
 * Компонент вкладки отзывов клиента
 * Отображает статистику и историю отзывов
 */
const ReviewsTab = () => {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const clientStats = await userService.getClientStats();
        setStats(clientStats);
      } catch (error) {
        console.error('Ошибка загрузки статистики отзывов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
          <p className="text-muted-foreground">Не удалось загрузить статистику отзывов</p>
        </CardContent>
      </Card>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Отзывов пока нет</h3>
          <p className="text-muted-foreground">
            Вы ещё не оставили ни одного отзыва. Посетите мастера и поделитесь впечлениями!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего отзывов</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Средняя оценка</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageRatingGiven.toFixed(1)}</p>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Последний отзыв</p>
                <p className="text-2xl font-bold">
                  {stats.recentReviews.length > 0 
                    ? formatCustomDate(new Date(stats.recentReviews[0].createdAt))
                    : 'Нет'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Распределение оценок */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение ваших оценок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.ratingDistribution.map((count, index) => {
              const rating = index + 1;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Последние отзывы */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши последние отзывы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div 
                key={review.id} 
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{review.masterName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.ratingNumber)}
                      <Badge variant="secondary">{review.ratingNumber}/5</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCustomDate(new Date(review.createdAt))}
                  </span>
                </div>
                {review.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    "{review.description}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsTab; 
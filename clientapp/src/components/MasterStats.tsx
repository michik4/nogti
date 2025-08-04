import React from "react";
import { Star, Calendar, Users, Award, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MasterStatsProps {
  master: {
    id?: string;
    fullName?: string;
    rating?: number | string;
    reviewsCount?: number;
    totalOrders?: number;
    completedOrders?: number;
    pendingOrders?: number;
    averageOrderPrice?: number;
    totalEarnings?: number;
    experienceYears?: number;
    specializations?: string[];
    // Структура данных с сервера
    todayEarnings?: number;
    monthlyEarnings?: number;
    todayClients?: number;
    monthlyClients?: number;
    averageRating?: number;
    completedBookings?: number;
    pendingRequests?: number;
    confirmedBookings?: number;
    canDoDesignsCount?: number;
    servicesCount?: number;
  };
  className?: string;
}

/**
 * Компонент для отображения статистики мастера
 */
const MasterStats: React.FC<MasterStatsProps> = ({ master, className = "" }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return "Отлично";
    if (rating >= 4.0) return "Хорошо";
    if (rating >= 3.0) return "Удовлетворительно";
    return "Требует улучшения";
  };

  // Преобразуем рейтинг в число
  const getRatingNumber = (rating: number | string | undefined): number => {
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'string') return parseFloat(rating) || 0;
    return 0;
  };

  const calculateCompletionRate = () => {
    // Поддержка обеих структур данных
    const totalOrders = master.totalOrders || master.completedBookings || 0;
    const completedOrders = master.completedOrders || master.completedBookings || 0;
    
    if (!totalOrders || totalOrders === 0) return 0;
    return Math.round(completedOrders / totalOrders * 100);
  };

  const calculateAverageResponseTime = () => {
    // Здесь можно добавить логику расчета среднего времени ответа
    // Пока возвращаем примерное значение
    return "2-4 часа";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Рейтинг */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getRatingColor(getRatingNumber(master.rating || master.averageRating))}`}>
                {getRatingNumber(master.rating || master.averageRating).toFixed(1)}
              </span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= getRatingNumber(master.rating || master.averageRating) ? "text-yellow-500 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getRatingText(getRatingNumber(master.rating || master.averageRating))}
            </p>
            <p className="text-xs text-muted-foreground">
              {master.reviewsCount || 0} отзывов
            </p>
          </CardContent>
        </Card>

        {/* Заказы */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заказы</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{master.totalOrders || master.completedBookings || 0}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{master.completedOrders || master.completedBookings || 0} выполнено</span>
            </div>
           
          </CardContent>
        </Card>

        {/* Опыт */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Опыт</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{master.experienceYears || master.servicesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {master.experienceYears ? 'лет в профессии' : 'услуг'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Процент выполнения заказов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Процент выполнения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Выполненные заказы</span>
              <span className="text-sm font-bold">{calculateCompletionRate()}%</span>
            </div>
            <Progress value={calculateCompletionRate()} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{master.completedOrders || master.completedBookings || 0} из {master.totalOrders || master.completedBookings || 0}</span>
              <span>Выполнено</span>
            </div>
          </CardContent>
        </Card>

        {/* Специализации */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Специализации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {master.specializations && master.specializations.length > 0 ? (
                master.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Специализации не указаны
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Дополнительная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Клиенты</p>
                <p className="text-xs text-muted-foreground">
                  Обслужено клиентов
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Время ответа</p>
                <p className="text-xs text-muted-foreground">
                  {calculateAverageResponseTime()}
                </p>
              </div>
            </div>
            
            {(master.totalEarnings || master.monthlyEarnings) && (master.totalEarnings > 0 || master.monthlyEarnings > 0) && (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Общий доход</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(master.totalEarnings || master.monthlyEarnings || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterStats; 
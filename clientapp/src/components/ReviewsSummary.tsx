// src/components/ReviewsSummary.tsx

import { Card } from "@/components/ui/card";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquarePlus, Plus, UserCheck, Shield } from "lucide-react";
import { formatCustomDate } from '@/utils/time.util';
import { masterRating } from '@/types/master-rating.type';
import { useReviewPermission } from '@/hooks/useReviewPermission';
import { useAuth } from '@/contexts/AuthContext';
import AddReviewForm from './AddReviewForm';
import { useState } from 'react';
import { Master } from '@/types/user.types';

interface ReviewsSummaryProps {
  ratings: masterRating[];
  totalReviews: number;
  isLoading: boolean;
  onShowAll: () => void;
  master: Master; // Добавляем мастера для проверки разрешений
  onReviewsUpdate?: () => void; // Callback для обновления отзывов
}

// Вспомогательная функция для рендера звезд
const renderStars = (rating: number) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

// Компонент для отображения статуса разрешения
const PermissionStatus = ({ status, isLoading }: { status: string, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-center p-4 border border-border rounded-lg bg-muted/50">
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  switch (status) {
    case 'notAuthenticated':
      return (
        <div className="flex items-center justify-center text-center p-4 border border-border rounded-lg bg-muted/50">
          <UserCheck className="w-5 h-5 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Войдите, чтобы оставить отзыв</span>
        </div>
      );
    case 'notClient':
      return (
        <div className="flex items-center justify-center text-center p-4 border border-border rounded-lg bg-muted/50">
          <Shield className="w-5 h-5 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Только клиенты могут оставлять отзывы</span>
        </div>
      );
    case 'alreadyReviewed':
      return (
        <div className="flex items-center justify-center text-center p-4 border border-border rounded-lg bg-muted/50">
          <Shield className="w-5 h-5 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Вы уже оставили отзыв</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center justify-center text-center p-4 border border-border rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Ошибка проверки</span>
        </div>
      );
    default:
      return null;
  }
};

export const ReviewsSummary = ({ ratings, totalReviews, isLoading, onShowAll, master, onReviewsUpdate }: ReviewsSummaryProps) => {
  const { user: currentUser } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { canReview, status, isLoading: permissionLoading } = useReviewPermission(master.id);

  const handleReviewAdded = () => {
    setShowReviewForm(false);
    if (onReviewsUpdate) {
      onReviewsUpdate();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        // Скелетон-лоадер
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      );
    }
    
    if (ratings.length === 0) {
      return (
        // Состояние, когда отзывов нет
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px]">
          <MessageSquarePlus className="w-10 h-10 mb-2 text-muted-foreground" />
          <p className="font-semibold">Отзывов пока нет</p>
          <p className="text-sm text-muted-foreground">Нажмите, чтобы оставить первый</p>
        </div>
      );
    }

    const firstReview = ratings[0];
    return (
      // Отображение первого отзыва
      <div>
        <div className="flex items-start space-x-4">
          <SmartAvatar 
            src={firstReview.client.avatar} 
            alt={firstReview.client.fullName}
            fallback={firstReview.client.fullName?.[0]}
            className="h-12 w-12"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{firstReview.client.fullName}</p>
              <p className="text-xs text-muted-foreground">{formatCustomDate(firstReview.createdAt)}</p>
            </div>
            {renderStars(firstReview.ratingNumber)}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {firstReview.description}
        </p>
        {totalReviews > 1 && (
           <p className="text-sm font-semibold text-primary mt-4 text-center">
             Показать все отзывы ({totalReviews})
           </p>
        )}
      </div>
    );
  };

  // Если показываем форму отзыва
  if (showReviewForm && canReview) {
    return (
      <Card className="p-4">
        <AddReviewForm 
          master={master}
          onReviewAdded={handleReviewAdded}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        {/* Основной контент */}
        <button
          onClick={onShowAll}
          className="w-full text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg p-2 -m-2"
          aria-label="Показать отзывы"
        >
          {renderContent()}
        </button>

        {/* Кнопка добавления отзыва или статус разрешения */}
        {currentUser && (
          <div className="mt-4 pt-4 border-t">
            {canReview ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Оставить отзыв
              </button>
            ) : (
              <PermissionStatus status={status} isLoading={permissionLoading} />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
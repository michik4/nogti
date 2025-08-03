
import { useEffect, useState } from 'react';
import { X, Star, ThumbsUp, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AddReviewForm from "./AddReviewForm";
import { masterRating } from '@/types/master-rating.type';
import { masterRatingService } from '@/services/master-rating.service';
import { MasterProfile } from '@/types/master.types';
import { Client, Master } from '../types/user.types';
import { formatCustomDate, formatDetailedDate } from '@/utils/time.util';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  client: Client;
  master: Master;
  ratingNumber: number;
  createdAt: string;
  description: string;
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  master: Master;
  onReviewsUpdate?: () => void; // Добавляем callback для обновления отзывов в родительском компоненте
}

export const ReviewsModal = ({ isOpen, onClose, master, onReviewsUpdate }: ReviewsModalProps) => {
  const { user: currentUser } = useAuth();
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<masterRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<masterRating | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterRatings = async () => {
      try {
        if (!master.id) {
          console.error('ID мастера не найден');
          return;
        }
        const masterRatingsData = await masterRatingService.getMasterRatingById(master.id);
        console.log('master ratings:', masterRatingsData);
        setRatings(masterRatingsData);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    }

    fetchMasterRatings();
  }, [master.id]);

  const handleLikeReview = (reviewId: string) => {
    const newLiked = new Set(likedReviews);
    if (newLiked.has(reviewId)) {
      newLiked.delete(reviewId);
    } else {
      newLiked.add(reviewId);
    }
    setLikedReviews(newLiked);
  };

  const handleReviewAdded = async () => {
    console.log('Новый отзыв добавлен');
    
    // Перезагружаем отзывы в модалке
    setIsLoading(true);
    try {
      const masterRatingsData = await masterRatingService.getMasterRatingById(master.id);
      console.log('Обновленные отзывы:', masterRatingsData);
      setRatings(masterRatingsData);
      
      // Вызываем callback для обновления отзывов в родительском компоненте (например, в ReviewsSummary)
      if (onReviewsUpdate) {
        onReviewsUpdate();
      }
    } catch (error) {
      console.error('Ошибка при обновлении отзывов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReview = (review: masterRating) => {
    setEditingReview(review);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await masterRatingService.deleteReview(reviewId);
      setDeletingReviewId(null);
      
      // Обновляем список отзывов
      await handleReviewAdded();
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
      alert('Не удалось удалить отзыв. Попробуйте снова.');
    }
  };

  const canEditOrDelete = (review: masterRating): boolean => {
    return currentUser?.id === review.client.id;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto h-[auto] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-center">Отзывы о {master.fullName}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Форма добавления отзыва или редактирования */}
              <AddReviewForm
                master={master}
                onReviewAdded={handleReviewAdded}
                editingReview={editingReview}
                onCancelEdit={handleCancelEdit}
              />

              <Separator />

              {/* Существующие отзывы */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Отзывы клиентов</h4>
                {ratings.map((rating) => (
                  <Card key={rating.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <SmartAvatar 
                        src={rating.client.avatar} 
                        alt={rating.client.fullName}
                        fallback={rating.client.fullName?.[0]}
                        className="w-10 h-10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{rating.client.fullName}</h4>
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-muted-foreground cursor-help">
                                    {formatCustomDate(rating.createdAt)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{formatDetailedDate(rating.createdAt)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {canEditOrDelete(rating) && (
                              <div className="flex gap-1 ml-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditReview(rating)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeletingReviewId(rating.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(rating.ratingNumber)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-3">{rating.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deletingReviewId} onOpenChange={() => setDeletingReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Ваш отзыв будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingReviewId && handleDeleteReview(deletingReviewId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

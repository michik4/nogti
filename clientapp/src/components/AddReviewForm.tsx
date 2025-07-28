// src/components/AddReviewForm.tsx

import { useState, useEffect } from "react";
import { Star, Send, Loader2, Info, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Master } from '../types/user.types';
import { masterRatingService, CreateMasterRatingPayload, UpdateMasterRatingPayload } from "../services/master-rating.service";
import { masterRating } from "@/types/master-rating.type";

// Вспомогательный компонент для отображения статуса
const StatusDisplay = ({ icon: Icon, title, message }: { icon: React.ElementType, title: string, message?: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-6 border border-border rounded-lg bg-muted/50 min-h-[200px]">
    <Icon className="w-10 h-10 mb-4 text-muted-foreground" />
    <h4 className="font-semibold text-lg">{title}</h4>
    {message && <p className="text-muted-foreground mt-1">{message}</p>}
  </div>
);

interface AddReviewFormProps {
  master: Master;
  onReviewAdded: () => void;
  editingReview?: masterRating; // Отзыв для редактирования (опционально)
  onCancelEdit?: () => void; // Callback для отмены редактирования
}

const AddReviewForm = ({ master, onReviewAdded, editingReview, onCancelEdit }: AddReviewFormProps) => {
  const [rating, setRating] = useState(editingReview?.ratingNumber || 0);
  const [reviewText, setReviewText] = useState(editingReview?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser, isClient } = useAuth();
  const navigate = useNavigate();
  const [reviewCheckStatus, setReviewCheckStatus] = useState<'loading' | 'exists' | 'notFound' | 'error'>('loading');

  const isEditMode = !!editingReview;

  useEffect(() => {
    // Если редактируем отзыв, устанавливаем статус как найденный
    if (isEditMode) {
      setReviewCheckStatus('exists');
      return;
    }

    if (isClient()) {
      const checkReview = async () => {
        setReviewCheckStatus('loading');
        try {
          const exists = await masterRatingService.checkExistReviewAtMaster(master.id);
          setReviewCheckStatus(exists ? 'exists' : 'notFound');
        } catch (error) {
          console.error("Ошибка при проверке наличия отзыва:", error);
          setReviewCheckStatus('error');
        }
      };
      checkReview();
    } else if (currentUser) {
      setReviewCheckStatus('notFound'); 
    }
  }, [master.id, isClient, currentUser, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient() || !currentUser?.id) return;
    if (rating === 0 || !reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && editingReview) {
        // Режим редактирования
        const updatePayload: UpdateMasterRatingPayload = {
          ratingNumber: rating,
          description: reviewText
        };
        await masterRatingService.updateReview(editingReview.id, updatePayload);
      } else {
        // Режим создания нового отзыва
        const reviewPayload: CreateMasterRatingPayload = {
          ratingNumber: rating,
          description: reviewText,
          masterId: master.id, 
          client: currentUser.id
        };
        await masterRatingService.sendReview(reviewPayload);
      }
      
      // Вызываем callback для обновления отзывов в родительских компонентах
      onReviewAdded();
      
      if (isEditMode) {
        // В режиме редактирования вызываем callback отмены редактирования
        onCancelEdit?.();
      } else {
        // Сбрасываем форму только при создании нового отзыва
        setReviewText("");
        setRating(0);
        
        // Устанавливаем статус, что отзыв уже существует, чтобы пользователь не мог отправить еще один
        setReviewCheckStatus('exists');
      }
    } catch (error) {
      console.error("Ошибка при отправке отзыва:", error);
      alert(`Не удалось ${isEditMode ? 'обновить' : 'отправить'} отзыв. Пожалуйста, попробуйте снова.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => (
    Array.from({ length: 5 }, (_, i) => (
      <button key={i} type="button" onClick={() => setRating(i + 1)} className="transition-transform hover:scale-110">
        <Star className={`w-6 h-6 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} />
      </button>
    ))
  );

  // --- ЛОГИКА РЕНДЕРИНГА ---

  if (!currentUser) {
    return <StatusDisplay icon={Ban} title="Доступ запрещен" message="Чтобы оставить отзыв, войдите в аккаунт." />;
  }
  if (!isClient()) {
    return <StatusDisplay icon={Ban} title="Действие недоступно" message="Только клиенты могут оставлять отзывы." />;
  }
  if (!isEditMode && reviewCheckStatus === 'loading') {
    return <StatusDisplay icon={Loader2} title="Проверка..." message="Загружаем информацию о ваших отзывах." />;
  }
  if (!isEditMode && reviewCheckStatus === 'exists') {
    return <StatusDisplay icon={ShieldCheck} title="Отзыв уже оставлен" message="Вы можете оставить только один отзыв для мастера." />;
  }
  if (!isEditMode && reviewCheckStatus === 'error') {
    return <StatusDisplay icon={Info} title="Произошла ошибка" message="Не удалось проверить отзывы. Попробуйте обновить." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <h4 className="font-semibold text-lg">
        {isEditMode ? 'Редактировать отзыв' : 'Оставить отзыв'}
      </h4>
      <div>
        <label className="block text-sm font-medium mb-2">Ваша оценка</label>
        <div className="flex gap-1">{renderStars()}</div>
      </div>
      <div>
        <label htmlFor="review-text" className="block text-sm font-medium mb-2">Ваш комментарий</label>
        <Textarea
          id="review-text"
          placeholder={`Расскажите о вашем опыте работы с ${master.fullName}...`}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-right text-muted-foreground mt-1">{reviewText.length}/500</p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={rating === 0 || !reviewText.trim() || isSubmitting} className="flex-1">
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {isSubmitting ? (isEditMode ? "Обновление..." : "Отправка...") : (isEditMode ? "Обновить отзыв" : "Отправить отзыв")}
        </Button>
        {isEditMode && onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddReviewForm;
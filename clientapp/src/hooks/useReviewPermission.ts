import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { masterRatingService } from '@/services/master-rating.service';
import { Master } from '@/types/user.types';

export type ReviewPermissionStatus = 'loading' | 'canReview' | 'alreadyReviewed' | 'notClient' | 'notAuthenticated' | 'error';

interface UseReviewPermissionReturn {
  canReview: boolean;
  status: ReviewPermissionStatus;
  isLoading: boolean;
  error: string | null;
}

export const useReviewPermission = (masterId: string): UseReviewPermissionReturn => {
  const { user: currentUser, isClient } = useAuth();
  const [status, setStatus] = useState<ReviewPermissionStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      // Сброс состояния
      setError(null);
      setStatus('loading');

      try {
        // Проверка аутентификации
        if (!currentUser) {
          setStatus('notAuthenticated');
          return;
        }

        // Проверка роли клиента
        if (!isClient()) {
          setStatus('notClient');
          return;
        }

        // Проверка существования отзыва
        const hasReview = await masterRatingService.checkExistReviewAtMaster(masterId);
        
        if (hasReview) {
          setStatus('alreadyReviewed');
        } else {
          setStatus('canReview');
        }

      } catch (err) {
        console.error('Ошибка при проверке разрешения на отзыв:', err);
        setStatus('error');
        setError('Не удалось проверить возможность оставления отзыва');
      }
    };

    if (masterId) {
      checkPermission();
    }
  }, [masterId, currentUser, isClient]);

  return {
    canReview: status === 'canReview',
    status,
    isLoading: status === 'loading',
    error
  };
}; 
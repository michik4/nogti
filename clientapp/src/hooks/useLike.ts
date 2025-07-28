import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { designService } from '@/services/designService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

interface UseLikeProps {
  designId: string;
  initialLikesCount: number;
  initialIsLiked?: boolean;
}

export const useLike = ({ designId, initialLikesCount, initialIsLiked = false }: UseLikeProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Проверяем статус лайка при загрузке (только для клиентов)
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (isAuthenticated && user && 'role' in user && user.role === 'client') {
        try {
          const response = await designService.checkIsLiked(designId);
          if (response.success && response.data) {
            setIsLiked(response.data.isLiked);
          }
        } catch (error) {
          console.error('Ошибка проверки статуса лайка:', error);
        }
      }
    };

    checkLikeStatus();
  }, [designId, isAuthenticated, user]);

  const likeMutation = useMutation({
    mutationFn: () => designService.toggleLike(designId),
    onMutate: async () => {
      // Оптимистичное обновление
      setIsLoading(true);
      const previousIsLiked = isLiked;
      const previousLikesCount = likesCount;
      
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
      return { previousIsLiked, previousLikesCount };
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setIsLiked(data.data.isLiked);
        setLikesCount(data.data.likesCount);
        
        // Обновляем кэш React Query
        queryClient.invalidateQueries({ queryKey: ['design', designId] });
        queryClient.invalidateQueries({ queryKey: ['designs'] });
        queryClient.invalidateQueries({ queryKey: ['likedDesigns'] });
      }
    },
    onError: (error, variables, context) => {
      // Откатываем оптимистичное обновление
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikesCount(context.previousLikesCount);
      }
      
      toast({
        title: "Ошибка",
        description: "Не удалось обновить лайк. Попробуйте позже.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleLike = async () => {
    // Проверяем аутентификацию
    if (!isAuthenticated || !user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы ставить лайки",
        variant: "default"
      });
      return;
    }

    // Проверяем, что это не гостевой пользователь
    if ('type' in user && user.type === 'guest') {
      toast({
        title: "Ограничение гостевого режима",
        description: "Зарегистрируйтесь, чтобы сохранять понравившиеся дизайны",
        variant: "default"
      });
      return;
    }

    // Проверяем, что это клиент (только клиенты могут ставить лайки)
    if ('role' in user && user.role !== 'client') {
      toast({
        title: "Недоступно",
        description: "Только клиенты могут ставить лайки дизайнам",
        variant: "default"
      });
      return;
    }

    likeMutation.mutate();
  };

  return {
    isLiked,
    likesCount,
    isLoading: isLoading || likeMutation.isPending,
    handleLike,
    canLike: isAuthenticated && user && 'role' in user && user.role === 'client'
  };
}; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Share2, Download, Flag, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLike } from '@/hooks/useLike';
import { NailDesign } from '@/services/designService';
import { getImageUrl } from '@/utils/image.util';
import styles from './DesignActions.module.css';
import { useNavigate } from 'react-router-dom';

interface DesignActionsProps {
  design: NailDesign;
}

const DesignActions: React.FC<DesignActionsProps> = ({ design }) => {
  const { toast } = useToast();
  const { user, isAuthenticated, isGuest, isClient, createGuestSession } = useAuth();
  const navigate = useNavigate();
  
  // Используем новый хук для лайков
  const { isLiked, likesCount, isLoading, handleLike, canLike } = useLike({
    designId: design.id,
    initialLikesCount: design.likesCount,
    initialIsLiked: design.isLiked
  });

  const handleBooking = () => {
    // Создаем гостевую сессию если пользователя нет
    if (!user) {
      createGuestSession();
    }

    // Проверяем, что пользователь - клиент
    if (!isClient()) {
      if (isGuest()) {
        toast({
          title: "Требуется регистрация",
          description: "Зарегистрируйтесь как клиент, чтобы записаться к мастеру",
          variant: "destructive",
          duration: 4000
        });
      } else if (user && 'role' in user && user.role === 'nailmaster') {
        toast({
          title: "Недоступно для мастеров",
          description: "Запись доступна только для клиентов",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему как клиент, чтобы записаться на услугу",
          variant: "destructive"
        });
      }
      return;
    }

    // TODO: Открыть модальное окно бронирования
    toast({
      title: "Бронирование",
      description: "Функция бронирования будет добавлена позже"
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: design.title,
          text: `Посмотрите этот дизайн ногтей: ${design.title}`,
          url: url
        });
      } catch (error) {
        // Пользователь отменил или ошибка
      }
    } else {
      // Fallback - копирование в буфер обмена
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Ссылка скопирована",
          description: "Ссылка на дизайн скопирована в буфер обмена"
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось скопировать ссылку",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveImage = () => {
    const link = document.createElement('a');
    link.href = getImageUrl(design.imageUrl) || design.imageUrl; 
    link.download = `${design.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Сохранение",
      description: "Изображение сохранено на устройство"
    });
  };

  const handleReport = () => {
    toast({
      title: "Жалоба отправлена",
      description: "Мы рассмотрим вашу жалобу в ближайшее время"
    });
  };

  const handleAuthPrompt = () => {
    navigate('/auth');
  };

  const renderClientActions = () => (
    <div className={styles.primaryActions}>
      <Button
        variant={isLiked ? "default" : "outline"}
        onClick={handleLike}
        className={styles.likeButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        )}
        {likesCount}
      </Button>

      <Button
        onClick={handleBooking}
        className={styles.bookingButton}
      >
        <Calendar className="w-4 h-4" />
        Записаться
      </Button>
    </div>
  );

  const renderGuestActions = () => (
    <div className={styles.primaryActions}>
      <Button
        variant="outline"
        onClick={handleAuthPrompt}
        className={styles.authButton}
      >
        <UserPlus className="w-4 h-4" />
        Войти, чтобы лайкать
      </Button>

      <Button
        variant="outline"
        onClick={handleAuthPrompt}
        className={styles.authButton}
      >
        <Calendar className="w-4 h-4" />
        Войти, чтобы записаться
      </Button>
    </div>
  );

  const renderMasterActions = () => (
    <div className={styles.primaryActions}>
      <Button
        variant="outline"
        disabled
        className={styles.disabledButton}
      >
        <Heart className="w-4 h-4" />
        Только для клиентов
      </Button>

      <Button
        variant="outline"
        disabled
        className={styles.disabledButton}
      >
        <Calendar className="w-4 h-4" />
        Только для клиентов
      </Button>
    </div>
  );

  const renderPrimaryActions = () => {
    if (isClient()) {
      return renderClientActions();
    } else if (isGuest() || !isAuthenticated) {
      return renderGuestActions();
    } else {
      return renderMasterActions();
    }
  };

  return (
    <Card className={styles.actionsCard}>
      <CardHeader>
        <CardTitle className={styles.title}>Действия</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {renderPrimaryActions()}
        
        <div className={styles.secondaryActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className={styles.actionButton}
          >
            <Share2 className="w-4 h-4" />
            Поделиться
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveImage}
            className={styles.actionButton}
          >
            <Download className="w-4 h-4" />
            Сохранить
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className={styles.reportButton}
          >
            <Flag className="w-4 h-4" />
            Пожаловаться
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignActions; 
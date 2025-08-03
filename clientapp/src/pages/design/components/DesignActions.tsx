import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Share2, Download, Flag, Loader2, UserPlus, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLike } from '@/hooks/useLike';
import { NailDesign } from '@/services/designService';
import { getImageUrl } from '@/utils/image.util';
import { MastersList } from '@/pages/designs/components/MastersList';
import { masterService } from '@/services/masterService';
import styles from './DesignActions.module.css';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface DesignActionsProps {
  design: NailDesign;
  onDesignAdded?: () => void; // Callback для обновления списка
}

const DesignActions: React.FC<DesignActionsProps> = ({ design, onDesignAdded }) => {
  const [showMasters, setShowMasters] = useState(false);
  const [isAddingToServices, setIsAddingToServices] = useState(false);
  const [isInMyDesigns, setIsInMyDesigns] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isGuest, isClient, isMaster, createGuestSession } = useAuth();
  const navigate = useNavigate();
  
  // Используем новый хук для лайков
  const { isLiked, likesCount, isLoading, handleLike, canLike } = useLike({
    designId: design.id,
    initialLikesCount: design.likesCount,
    initialIsLiked: design.isLiked
  });

  // Проверяем, есть ли дизайн в списке "Я так могу"
  useEffect(() => {
    const checkIfInMyDesigns = async () => {
      if (isMaster() && user) {
        try {
          const myDesigns = await masterService.getMasterDesigns();
          const isInList = myDesigns.some((masterDesign: any) => 
            masterDesign.nailDesign?.id === design.id
          );
          setIsInMyDesigns(isInList);
        } catch (error) {
          console.error('Ошибка проверки дизайна в списке:', error);
        }
      }
    };

    checkIfInMyDesigns();
  }, [design.id, isMaster, user]);

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

  const handleFindMasters = () => {
    setShowMasters(true);
  };

  const handleAddToServices = async () => {
    if (!user || !isMaster()) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему как мастер, чтобы добавить дизайн в свои услуги",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingToServices(true);
      
      // Добавляем дизайн в список "Я так могу"
      await masterService.addCanDoDesign(design.id, {
        customPrice: design.estimatedPrice || 0,
        notes: `Дизайн: ${design.title}`,
        estimatedDuration: 60 // базовое время выполнения
      });

      toast({
        title: "Дизайн добавлен!",
        description: `"${design.title}" добавлен в ваш список услуг`,
        variant: "default"
      });
      
      // Обновляем состояние
      setIsInMyDesigns(true);
      
      // Вызываем callback для обновления списка
      if (onDesignAdded) {
        onDesignAdded();
      }
    } catch (error: any) {
      console.error('Ошибка добавления дизайна в услуги:', error);
      
      if (error.message?.includes('уже добавлен')) {
        toast({
          title: "Дизайн уже добавлен",
          description: "Этот дизайн уже есть в вашем списке услуг",
          variant: "destructive"
        });
        // Обновляем состояние, если дизайн уже в списке
        setIsInMyDesigns(true);
      } else {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось добавить дизайн в услуги",
          variant: "destructive"
        });
      }
    } finally {
      setIsAddingToServices(false);
    }
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
        onClick={handleFindMasters}
        className={styles.mastersButton}
      >
        <Users className="w-4 h-4" />
        Найти мастеров
      </Button>

     
    </div>
  );

  const renderGuestActions = () => (
    <div className={styles.primaryActions}>
      <Button
        onClick={handleFindMasters}
        className={styles.mastersButton}
      >
        <Users className="w-4 h-4" />
        Найти мастеров
      </Button>

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

      {/* Кнопка "Я так могу" для мастеров */}
      {!isInMyDesigns && (
        <Button
          variant="default"
          onClick={handleAddToServices}
          disabled={isAddingToServices}
          className={`${styles.addToServicesButton} bg-pink-500 hover:bg-pink-600 text-white`}
        >
          {isAddingToServices ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Я так могу
        </Button>
      )}

      {/* Показываем бейдж, если дизайн уже в списке */}
      {isInMyDesigns && (
        <Badge variant="secondary" className={styles.addToServicesButton}>
          <CheckCircle className="w-4 h-4 mr-1" />
          В моих услугах
        </Badge>
      )}
    </div>
  );

  const renderPrimaryActions = () => {
    if (isMaster()) {
      return renderMasterActions();
    } else if (isClient()) {
      return renderClientActions();
    } else if (isGuest() || !isAuthenticated) {
      return renderGuestActions();
    }
  };

  return (
    <>
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

      {/* Модальное окно со списком мастеров */}
      <MastersList
        design={design}
        isOpen={showMasters}
        onClose={() => setShowMasters(false)}
      />
    </>
  );
};

export default DesignActions; 
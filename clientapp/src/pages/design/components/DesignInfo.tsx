import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Heart, BookOpen, Calendar, Users, CheckCircle, Loader2 } from 'lucide-react';
import { NailDesign } from '@/services/designService';
import { getColorHex } from '@/utils/color.util';
import { MastersList } from '@/pages/designs/components/MastersList';
import { useAuth } from '@/contexts/AuthContext';
import { masterService } from '@/services/masterService';
import { useToast } from '@/hooks/use-toast';
import styles from './DesignInfo.module.css';

interface DesignInfoProps {
  design: NailDesign;
  onDesignAdded?: () => void; // Callback для обновления списка
}

const DesignInfo: React.FC<DesignInfoProps> = ({ design, onDesignAdded }) => {
  const [showMasters, setShowMasters] = useState(false);
  const [isAddingToServices, setIsAddingToServices] = useState(false);
  const { user, isMaster } = useAuth();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <>
      <Card className={styles.infoCard}>
        <CardHeader>
          <CardTitle className={styles.title}>Информация о дизайне</CardTitle>
        </CardHeader>
        <CardContent className={styles.content}>
          {design.description && (
            <div className={styles.description}>
              <p>{design.description}</p>
            </div>
          )}

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <Heart className="w-4 h-4 text-red-500" />
              <span>{design.likesCount} лайков</span>
            </div>
            <div className={styles.statItem}>
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>{design.ordersCount} заказов</span>
            </div>
          </div>

          {design.color && (
            <div className={styles.colorInfo}>
              <span className={styles.colorLabel}>Основной цвет:</span>
              <div 
                className={styles.colorSwatch}
                style={{ backgroundColor: getColorHex(design.color) }}
                title={design.color}
              />
              <span className={styles.colorValue}>{design.color}</span>
            </div>
          )}

          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <Calendar className="w-4 h-4" />
              <span>Создан: {formatDate(design.createdAt)}</span>
            </div>
            
            <div className={styles.statusBadges}>
              <Badge 
                variant={design.isActive ? "default" : "secondary"}
                className={styles.statusBadge}
              >
                {design.isActive ? 'Активен' : 'Неактивен'}
              </Badge>
              
              <Badge 
                variant={design.isModerated ? "default" : "outline"}
                className={styles.statusBadge}
              >
                {design.isModerated ? 'Проверен' : 'На модерации'}
              </Badge>
              
              <Badge variant="outline" className={styles.sourceBadge}>
                {design.source === 'admin' ? 'Администратор' : 
                 design.source === 'master' ? 'Мастер' : 'Клиент'}
              </Badge>
            </div>
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

export default DesignInfo; 
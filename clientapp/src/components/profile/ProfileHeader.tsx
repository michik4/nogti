import { useState, useEffect } from "react";
import { Edit2, User, MapPin, Calendar, Home, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Client, Master, Guest } from "@/types/user.types";
import { useNavigate } from "react-router-dom";
import { userService, ClientStats } from "@/services/userService";
import AvatarUpload from "@/components/ui/avatar-upload";
import { getImageUrl } from "@/utils/image.util";

interface ProfileHeaderProps {
  onEditProfile: () => void;
  onConvertGuest: () => void;
}

/**
 * Компонент заголовка профиля пользователя
 * Отображает основную информацию о пользователе и кнопки действий
 */
const ProfileHeader = ({ onEditProfile, onConvertGuest }: ProfileHeaderProps) => {
  const { user: currentUser, isGuest } = useAuth();
  const navigate = useNavigate();
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const isGuestUser = isGuest();
  const isClientUser = !isGuestUser && 'role' in currentUser && currentUser.role === 'client';

  // Загружаем статистику клиента
  useEffect(() => {
    if (isClientUser) {
      const loadClientStats = async () => {
        setIsLoadingStats(true);
        try {
          const stats = await userService.getClientStats();
          setClientStats(stats);
        } catch (error) {
          console.error('Ошибка загрузки статистики клиента:', error);
        } finally {
          setIsLoadingStats(false);
        }
      };

      loadClientStats();
    }
  }, [isClientUser]);

  if (!currentUser) return null;

  // Функция для обработки русского текста
  const processRussianText = (text: string | undefined): string => {
    if (!text) return '';
    
    try {
      // Пытаемся декодировать UTF-8 если текст содержит закодированные символы
      if (text.includes('%')) {
        return decodeURIComponent(text);
      }
      return text;
    } catch (error) {
      console.warn('Ошибка обработки русского текста:', error);
      return text;
    }
  };

  // Улучшенная логика получения имени пользователя с приоритетом серверных данных
  const displayName = (() => {
    // Для гостевых пользователей используем name
    if (isGuestUser && 'name' in currentUser) {
      return processRussianText(currentUser.name);
    }
    
    // Для авторизованных пользователей приоритет у fullName
    if ('fullName' in currentUser && currentUser.fullName) {
      const processedName = processRussianText(currentUser.fullName);
      console.log('Используется fullName из профиля:', processedName);
      return processedName;
    }
    
    // Fallback на name
    if ('name' in currentUser && currentUser.name) {
      const processedName = processRussianText(currentUser.name);
      console.log('Используется name из профиля:', processedName);
      return processedName;
    }
    
    // Последний fallback на email
    console.log('Используется email как имя пользователя:', currentUser.email);
    return currentUser.email;
  })();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Аватар пользователя с возможностью загрузки */}
          <AvatarUpload
            currentAvatar={currentUser.avatar}
            userName={displayName}
            size="lg"
            showUploadButton={false}
            className="self-center md:self-start"
            onAvatarUpdate={(newAvatarUrl) => {
              // Callback уже обрабатывается внутри AvatarUpload через updateUser
              console.log('Аватар обновлен в ProfileHeader:', newAvatarUrl);
            }}
          />
          
          {/* Основная информация о пользователе */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {isGuestUser && (
                <Badge variant="secondary" className="mt-1">
                  Гостевой аккаунт
                </Badge>
              )}
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {'location' in currentUser ? currentUser.location : 'Не указано'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  С {'joinDate' in currentUser ? currentUser.joinDate : 'недавно'}
                </span>
              </div>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Button>
              
              {!isGuestUser && (
                <Button variant="outline" onClick={onEditProfile}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              )}
              
              {isGuestUser && (
                <Button onClick={onConvertGuest} className="gradient-bg text-white">
                  <User className="w-4 h-4 mr-2" />
                  Создать постоянный аккаунт
                </Button>
              )}
            </div>
          </div>
          
          
          
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;

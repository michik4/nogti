import { useState, useEffect } from "react";
import { Edit2, User, MapPin, Calendar, Home, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Client, Master, Guest, User as UserType } from "@/types/user.types";
import { useNavigate } from "react-router-dom";
import { userService, ClientStats } from "@/services/userService";
import AvatarUpload from "@/components/ui/avatar-upload";
import { getImageUrl } from "@/utils/image.util";
import { formatDate } from "@/utils/format.util";

interface ProfileHeaderProps {
  onEditProfile: () => void;
  onConvertGuest: () => void;
  userData?: UserType | Guest;
}

/**
 * Компонент заголовка профиля пользователя
 * Отображает основную информацию о пользователе и кнопки действий
 */
const ProfileHeader = ({ onEditProfile, onConvertGuest, userData }: ProfileHeaderProps) => {
  const { user: currentUser, isGuest, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const isGuestUser = isGuest();
  const isClientUser = !isGuestUser && 'role' in currentUser && currentUser.role === 'client';

  // Используем переданные данные профиля или данные из контекста
  const displayUser = userData || currentUser;

  if (!displayUser) return null;

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
    if (isGuestUser && 'name' in displayUser) {
      return processRussianText(displayUser.name);
    }
    
    // Для авторизованных пользователей приоритет у fullName
    if ('fullName' in displayUser && displayUser.fullName) {
      const processedName = processRussianText(displayUser.fullName);
      console.log('ProfileHeader: Используется fullName из профиля:', processedName);
      return processedName;
    }
    
    // Fallback на name
    if ('name' in displayUser && displayUser.name) {
      const processedName = processRussianText(displayUser.name);
      console.log('ProfileHeader: Используется name из профиля:', processedName);
      return processedName;
    }
    
    // Последний fallback на email
    const email = 'email' in displayUser ? displayUser.email : '';
    console.log('ProfileHeader: Используется email как имя пользователя:', email);
    return email;
  })();

  // Получаем email пользователя
  const userEmail = (() => {
    if ('email' in displayUser && typeof displayUser.email === 'string') {
      return displayUser.email;
    }
    return '';
  })();

  // Получаем местоположение пользователя
  const userLocation = (() => {
    if ('location' in displayUser && displayUser.location && typeof displayUser.location === 'string') {
      return processRussianText(displayUser.location);
    }
    if ('address' in displayUser && displayUser.address && typeof displayUser.address === 'string') {
      return processRussianText(displayUser.address);
    }
    return 'Не указано';
  })();

  // Получаем дату регистрации
  const joinDate = (() => {
    if (isGuestUser && 'joinDate' in displayUser && typeof displayUser.joinDate === 'string') {
      return formatDate(displayUser.joinDate);
    }
    if ('createdAt' in displayUser && displayUser.createdAt && typeof displayUser.createdAt === 'string') {
      return formatDate(displayUser.createdAt);
    }
    return 'недавно';
  })();

  // Получаем аватар пользователя
  const userAvatar = (() => {
    if ('avatar' in displayUser && typeof displayUser.avatar === 'string') {
      return displayUser.avatar;
    }
    return '';
  })();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Аватар пользователя с возможностью загрузки */}
          <AvatarUpload
            currentAvatar={userAvatar}
            userName={displayName}
            size="lg"
            showUploadButton={false}
            className="self-center md:self-start"
            onAvatarUpdate={(newAvatarUrl) => {
              // Callback уже обрабатывается внутри AvatarUpload через updateUser
              console.log('ProfileHeader: Аватар обновлен:', newAvatarUrl);
              // Не вызываем refreshUser здесь, так как это может вызвать цикличный рендер
              // AvatarUpload уже обновляет токены автоматически
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
              <p className="text-muted-foreground">{userEmail}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  С {joinDate}
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

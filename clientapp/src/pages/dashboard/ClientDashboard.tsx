import { useState, useEffect } from "react";
import { ArrowLeft, Settings, LogOut, Calendar, Heart, Upload, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EditProfileModal from "@/components/EditProfileModal";
import UploadContentModal from "@/components/UploadContentModal";
import ConvertGuestModal from "@/components/ConvertGuestModal";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BookingsTab from "@/components/profile/BookingsTab";
import FavoritesTab from "@/components/profile/FavoritesTab";
import UploadsTab from "@/components/profile/UploadsTab";
import ReviewsTab from "@/components/profile/ReviewsTab";
import PageHeader from "@/components/PageHeader";
import { authService } from "@/services/authService";
import { User } from "@/types/user.types";

/**
 * Страница профиля пользователя
 * Отображает информацию о пользователе и его активность
 */
const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout, isGuest, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();
  
  // Перенаправление неавторизованных пользователей
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Загружаем актуальные данные профиля с сервера
  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser || isGuest()) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        console.log('Загружаем актуальные данные профиля с сервера...');
        
        // Получаем актуальные данные профиля через API
        const profile = await authService.getProfile();
        console.log('Получены данные профиля с сервера:', profile);
        
        setProfileData(profile);
        
        // Обновляем данные в контексте авторизации только один раз при загрузке
        // Убираем refreshUser из зависимостей, чтобы избежать цикличного рендера
        
      } catch (error) {
        console.error('Ошибка загрузки профиля с сервера:', error);
        toast({
          title: "Ошибка загрузки профиля",
          description: "Не удалось загрузить актуальные данные профиля.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [currentUser, isGuest, toast]); // Убрали refreshUser из зависимостей

  if (!currentUser) {
    return null;
  }

  const isGuestUser = isGuest();

  // Используем данные профиля с сервера, если они доступны
  const userData = profileData || currentUser;

  // Обработчик повторной записи
  const handleBookAgain = (designId: string) => {
    toast({
      title: "Записаться снова",
      description: "Функция записи будет доступна в следующем обновлении.",
    });
  };

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из аккаунта.",
    });
    navigate("/");
  };

  // Обработчик закрытия модального окна редактирования профиля
  const handleEditProfileClose = async () => {
    setIsEditModalOpen(false);
    
    // Обновляем профиль после закрытия модального окна только если это не гость
    if (currentUser && !isGuest()) {
      try {
        console.log('Обновляем профиль после редактирования...');
        const updatedProfile = await authService.getProfile();
        setProfileData(updatedProfile);
        // Не вызываем refreshUser здесь, так как это может вызвать цикличный рендер
        console.log('Профиль успешно обновлен после редактирования');
      } catch (error) {
        console.warn('Не удалось обновить профиль после редактирования:', error);
      }
    }
  };

  // Показываем загрузку, если данные профиля еще загружаются
  if (isLoadingProfile && !isGuestUser) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader
          title="Личный кабинет"
          subtitle="Загрузка данных профиля..."
          showBackButton={false}
        />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Личный кабинет"
        subtitle="Управление профилем и записями"
        showBackButton={false}
      />
      
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Заголовок профиля */}
        <ProfileHeader 
          onEditProfile={() => setIsEditModalOpen(true)}
          onConvertGuest={() => setIsConvertModalOpen(true)}
          userData={userData}
        />

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Записи
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Понравившиеся
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Мои отзывы
            </TabsTrigger>
            <TabsTrigger value="uploads" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Загрузки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsTab onBookAgain={handleBookAgain} />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab onBookAgain={handleBookAgain} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>

          <TabsContent value="uploads">
            <UploadsTab />
          </TabsContent>
        </Tabs>

        {/* Карточка выхода */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Модальные окна */}
      {!isGuestUser && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={handleEditProfileClose} 
        />
      )}
      
      <UploadContentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      {isGuestUser && (
        <ConvertGuestModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientDashboard;

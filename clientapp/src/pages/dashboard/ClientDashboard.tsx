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
  const { toast } = useToast();
  
  // Перенаправление неавторизованных пользователей
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Обновление профиля при загрузке страницы для получения корректных данных с сервера
  useEffect(() => {
    if (currentUser && !isGuest()) {
      console.log('Обновляем профиль пользователя для получения корректных данных с сервера');
      refreshUser().catch(error => {
        console.warn('Не удалось обновить профиль при загрузке страницы:', error);
        // Не показываем toast, чтобы не мешать пользователю
      });
    }
  }, []); // Выполняем только при первой загрузке

  if (!currentUser) {
    return null;
  }

  const isGuestUser = isGuest();

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Заголовок страницы */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Профиль клиента</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        {/* Заголовок профиля */}
        <ProfileHeader 
          onEditProfile={() => setIsEditModalOpen(true)}
          onConvertGuest={() => setIsConvertModalOpen(true)}
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
      </main>

      {/* Модальные окна */}
      {!isGuestUser && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
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

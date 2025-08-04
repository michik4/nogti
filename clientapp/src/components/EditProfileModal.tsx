import React, { useState, useEffect } from "react";
import { Edit2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarUpload from "@/components/ui/avatar-upload";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { User } from "@/types/user.types";
import { useToast } from "@/hooks/use-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { user: currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Загружаем актуальные данные профиля с сервера при открытии модального окна
  useEffect(() => {
    const loadProfileData = async () => {
      if (!isOpen || !currentUser) return;
      
      try {
        setIsLoadingProfile(true);
        console.log('EditProfileModal: Загружаем актуальные данные профиля...');
        
        const profile = await authService.getProfile();
        console.log('EditProfileModal: Получены данные профиля:', profile);
        
        setProfileData(profile);
        
        // Обновляем форму с актуальными данными
        setFormData({
          name: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: (profile as any)?.location || (profile as any)?.address || "",
          avatar: profile.avatar || "/placeholder.svg"
        });
        
      } catch (error) {
        console.error('EditProfileModal: Ошибка загрузки профиля:', error);
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
  }, [isOpen, currentUser, toast]);
  
  const updateUserProfile = async (data: any) => {
    try {
      // Подготавливаем данные для обновления
      const updateData = {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location
      };

      console.log('Обновление профиля клиента:', updateData);
      
      // Вызываем API для обновления профиля
      const response = await userService.updateProfile('', updateData);
      
      if (response.success) {
        // Не вызываем refreshUser здесь, так как это может вызвать цикличный рендер
        // Токены уже обновлены в userService.updateProfile
        console.log('Профиль клиента успешно обновлен:', response.data);
        
        // Если получены новые токены, обновляем их в контексте авторизации
        if (response.data && response.data.token && response.data.refreshToken) {
          console.log('Обновляем токены в контексте авторизации');
          // Токены уже обновлены в userService.updateProfile
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Ошибка обновления профиля клиента:', error);
      throw error;
    }
  };
  
  const [formData, setFormData] = useState({
    name: (currentUser as any)?.fullName || (currentUser as any)?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    location: (currentUser as any)?.location || (currentUser as any)?.address || "",
    avatar: currentUser?.avatar || "/placeholder.svg"
  });

  // Обновляем форму при изменении пользователя или данных профиля
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        location: (profileData as any)?.location || (profileData as any)?.address || "",
        avatar: profileData.avatar || "/placeholder.svg"
      });
    } else if (currentUser) {
      setFormData({
        name: (currentUser as any)?.fullName || (currentUser as any)?.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: (currentUser as any)?.location || (currentUser as any)?.address || "",
        avatar: currentUser.avatar || "/placeholder.svg"
      });
    }
  }, [currentUser, profileData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Валидация формы
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Имя обязательно для заполнения.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Email обязателен для заполнения.",
        variant: "destructive",
      });
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Ошибка валидации",
        description: "Введите корректный email адрес.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены.",
      });
      onClose();
    } catch (error: any) {
      console.error('Ошибка при обновлении профиля:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = "Не удалось обновить профиль.";
      
      if (error.message?.includes('email уже существует')) {
        errorMessage = "Пользователь с таким email уже существует.";
      } else if (error.message?.includes('не найден')) {
        errorMessage = "Пользователь не найден.";
      } else if (error.message?.includes('не авторизован')) {
        errorMessage = "Необходимо войти в систему.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    console.log('Обновление аватара в форме клиента:', newAvatarUrl);
    setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
  };

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

  // Показываем загрузку, если данные профиля загружаются
  if (isLoadingProfile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>
              Загрузка данных профиля...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
          <DialogDescription>
            Обновите информацию о себе
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center mb-4">
            <div onClick={(e) => e.stopPropagation()}>
              <AvatarUpload
                currentAvatar={formData.avatar}
                userName={processRussianText(formData.name)}
                onAvatarUpdate={handleAvatarUpdate}
                size="lg"
                showUploadButton={true}
                className="self-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Город, район"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              onClick={(e) => e.stopPropagation()}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;

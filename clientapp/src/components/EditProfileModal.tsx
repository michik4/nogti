import React, { useState } from "react";
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
  
  const updateUserProfile = async (data: any) => {
    try {
      // Подготавливаем данные для обновления
      const updateData = {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location
      };

      console.log('Обновление профиля:', updateData);
      
      // Вызываем API для обновления профиля
      const response = await userService.updateProfile('', updateData);
      
      if (response.success) {
        // Обновляем данные пользователя в контексте
        await refreshUser();
        console.log('Профиль успешно обновлен:', response.data);
      } else {
        throw new Error(response.message || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
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

  // Обновляем форму при изменении пользователя
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        name: (currentUser as any)?.fullName || (currentUser as any)?.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: (currentUser as any)?.location || (currentUser as any)?.address || "",
        avatar: currentUser.avatar || "/placeholder.svg"
      });
    }
  }, [currentUser]);

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
    
    setIsSubmitting(true);
    try {
      await updateUserProfile(formData);
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    console.log('Обновление аватара в форме:', newAvatarUrl);
    setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
  };

  // Убираем эту проверку, чтобы модальное окно отображалось
  // if (!currentUser) return null;

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
                userName={formData.name}
                onAvatarUpdate={handleAvatarUpdate}
                size="lg"
                showUploadButton={true}
                className="self-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onClick={(e) => e.stopPropagation()}
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              onClick={(e) => e.stopPropagation()}
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

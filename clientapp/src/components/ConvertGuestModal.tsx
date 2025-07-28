import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ConvertGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно для преобразования гостевого аккаунта
 * Позволяет гостю создать постоянный аккаунт клиента или мастера
 */
const ConvertGuestModal = ({ isOpen, onClose }: ConvertGuestModalProps) => {
  const { user: currentUser, convertGuestToUser, isGuest } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'nailmaster'>('client');
  const [formData, setFormData] = useState({
    name: currentUser ? ('name' in currentUser ? currentUser.name : currentUser.fullName || '') : "",
    email: "",
    phone: ""
  });

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.phone) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    convertGuestToUser(userType, formData);
    
    toast.success("Аккаунт успешно создан! Добро пожаловать в NailMasters!");
    
    onClose();
    
    // Перенаправление в зависимости от типа пользователя
    if (userType === 'nailmaster') {
      navigate("/master-dashboard");
    } else {
      navigate("/client-dashboard");
    }
  };

  // Проверка, что пользователь - гость
  if (!currentUser || !isGuest()) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать постоянный аккаунт</DialogTitle>
          <DialogDescription>
            Сохраните свои данные и получите полный доступ ко всем функциям
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Выбор типа аккаунта */}
          <div className="space-y-2">
            <Label>Тип аккаунта</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={userType === 'client' ? 'default' : 'outline'}
                onClick={() => setUserType('client')}
                className="w-full"
              >
                Клиент
              </Button>
              <Button
                type="button"
                variant={userType === 'nailmaster' ? 'default' : 'outline'}
                onClick={() => setUserType('nailmaster')}
                className="w-full"
              >
                Мастер
              </Button>
            </div>
          </div>

          {/* Поля формы */}
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              Создать аккаунт
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertGuestModal;

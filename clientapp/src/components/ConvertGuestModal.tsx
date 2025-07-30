import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ConvertGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConversionStep = 'form' | 'converting' | 'success' | 'error';

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
    phone: "",
    password: ""
  });
  const [conversionStep, setConversionStep] = useState<ConversionStep>('form');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');

  // Сброс состояния при открытии модального окна
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConversionStep('form');
      setProgress(0);
      setError('');
    }
    onClose();
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.phone || !formData.password) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    // Проверяем минимальную длину пароля
    if (formData.password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    setConversionStep('converting');
    setProgress(0);
    setError('');

    // Имитируем прогресс конвертации
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await convertGuestToUser(userType, formData);
      
      setProgress(100);
      setConversionStep('success');
      
      // Задержка перед закрытием и перенаправлением
      setTimeout(() => {
        toast.success("Аккаунт успешно создан! Добро пожаловать в NailMasters!");
        
        // Перенаправление в зависимости от типа пользователя
        if (userType === 'nailmaster') {
          navigate("/master-dashboard");
        } else {
          navigate("/client-dashboard");
        }
        
        handleOpenChange(false);
      }, 1500);
      
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setConversionStep('error');
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      console.error('Ошибка создания аккаунта:', error);
    }
  };

  // Проверка, что пользователь - гость
  if (!currentUser || !isGuest()) {
    return null;
  }

  const renderStepContent = () => {
    switch (conversionStep) {
      case 'form':
        return (
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

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Минимум 6 символов"
                required
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
                Отмена
              </Button>
              <Button type="submit" className="flex-1">
                Создать аккаунт
              </Button>
            </div>
          </form>
        );

      case 'converting':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Создание аккаунта...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Пожалуйста, подождите, мы создаем ваш постоянный аккаунт
              </p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Аккаунт создан успешно!</h3>
              <p className="text-sm text-muted-foreground">
                Вы будете перенаправлены на главную страницу
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Ошибка создания аккаунта</h3>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setConversionStep('form')}
                  className="flex-1"
                >
                  Попробовать снова
                </Button>
                <Button 
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {conversionStep === 'form' && "Создать постоянный аккаунт"}
            {conversionStep === 'converting' && "Создание аккаунта"}
            {conversionStep === 'success' && "Успешно!"}
            {conversionStep === 'error' && "Ошибка"}
          </DialogTitle>
          <DialogDescription>
            {conversionStep === 'form' && "Сохраните свои данные и получите полный доступ ко всем функциям"}
            {conversionStep === 'converting' && "Пожалуйста, подождите..."}
            {conversionStep === 'success' && "Ваш аккаунт успешно создан"}
            {conversionStep === 'error' && "Произошла ошибка при создании аккаунта"}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertGuestModal;

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import ConvertGuestModal from "./ConvertGuestModal";

interface GuestModeNotificationProps {
  onDismiss?: () => void;
  showOnBookingAttempt?: boolean;
}

/**
 * Компонент уведомления для гостевых пользователей
 * Показывает предложение зарегистрироваться для полного доступа к функциям
 */
const GuestModeNotification = ({ onDismiss, showOnBookingAttempt = false }: GuestModeNotificationProps) => {
  const { isGuest } = useAuth();
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isGuest() || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleRegisterClick = () => {
    setShowConvertModal(true);
  };

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {showOnBookingAttempt ? "Для записи нужна регистрация" : "Гостевой режим"}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {showOnBookingAttempt 
                  ? "Зарегистрируйтесь, чтобы записаться к мастеру и отслеживать свои заказы"
                  : "Зарегистрируйтесь, чтобы сохранять избранное, оставлять отзывы и записываться к мастерам"
                }
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Зарегистрироваться
                </Button>
                {!showOnBookingAttempt && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleDismiss}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/30"
                  >
                    Позже
                  </Button>
                )}
              </div>
            </div>
          </div>
          {!showOnBookingAttempt && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/30"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      <ConvertGuestModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
      />
    </>
  );
};

export default GuestModeNotification;

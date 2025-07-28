import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { Order } from "@/types/booking.types";

interface CompleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (masterNotes?: string, rating?: number) => Promise<void>;
  order: Order | null;
}

const CompleteOrderModal: React.FC<CompleteOrderModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  order
}) => {
  const [masterNotes, setMasterNotes] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onComplete(masterNotes || undefined, rating || undefined);
      onClose();
      setMasterNotes("");
      setRating(0);
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setMasterNotes("");
      setRating(0);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Завершить заказ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Информация о заказе */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{order.client?.fullName || 'Клиент'}</p>
            <p className="text-sm text-muted-foreground">{order.masterService?.name}</p>
            {order.nailDesign && (
              <p className="text-sm text-muted-foreground">{order.nailDesign.title}</p>
            )}
          </div>

          {/* Оценка работы */}
          <div className="space-y-2">
            <Label>Оценка работы (необязательно)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  disabled={isLoading}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Заметки */}
          <div className="space-y-2">
            <Label htmlFor="masterNotes">Заметки (необязательно)</Label>
            <Textarea
              id="masterNotes"
              placeholder="Добавьте заметки о выполненной работе..."
              value={masterNotes}
              onChange={(e) => setMasterNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Предупреждение */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              После завершения заказа его нельзя будет изменить. Убедитесь, что работа выполнена.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Завершаем...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Завершить заказ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteOrderModal; 
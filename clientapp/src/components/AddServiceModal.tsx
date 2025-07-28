import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddServiceForm } from "./AddServiceForm";
import { MasterService } from "@/types/master.types";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (service: Partial<MasterService>) => Promise<void>;
}

export const AddServiceModal = ({ isOpen, onClose, onSubmit }: AddServiceModalProps) => {
  const handleSubmit = async (service: Partial<MasterService>) => {
    await onSubmit(service);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить новую услугу</DialogTitle>
        </DialogHeader>
        <AddServiceForm onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}; 
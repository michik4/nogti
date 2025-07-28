
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientInfo {
  name: string;
  phone: string;
  email?: string;
  notes: string;
}

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  onClientInfoChange: (updates: Partial<ClientInfo>) => void;
  showEmail?: boolean;
}

/**
 * Компонент формы для ввода данных клиента
 * Используется в модальных окнах бронирования
 */
const ClientInfoForm = ({
  clientInfo,
  onClientInfoChange,
  showEmail = false
}: ClientInfoFormProps) => {
  const handleInputChange = (field: keyof ClientInfo, value: string) => {
    onClientInfoChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">
        {showEmail ? "Ваши данные" : "Данные клиента"}
      </Label>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">
            {showEmail ? "Имя *" : "Имя клиента *"}
          </Label>
          <Input
            id="clientName"
            placeholder={showEmail ? "Ваше имя" : "Имя клиента"}
            value={clientInfo.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="clientPhone">Телефон *</Label>
          <Input
            id="clientPhone"
            placeholder="+7 (999) 999-99-99"
            value={clientInfo.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
      </div>
      
      {showEmail && (
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={clientInfo.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="notes">Комментарий</Label>
        <Input
          id="notes"
          placeholder="Дополнительные пожелания..."
          value={clientInfo.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
        />
      </div>
    </div>
  );
};

export default ClientInfoForm;
export type { ClientInfo };

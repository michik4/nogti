import { useState } from "react";
import { Upload, Image, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// Заглушка: функциональность загрузки еще не реализована
// import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadContentModal = ({ isOpen, onClose }: UploadContentModalProps) => {
  // Заглушка для функции добавления загрузки
  const addUpload = (upload: any) => {
    console.log('Загрузка добавлена (заглушка):', upload);
  };
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    type: "photo" as "photo" | "video"
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Определяем тип файла автоматически
      if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, type: "video" }));
      } else {
        setFormData(prev => ({ ...prev, type: "photo" }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название для загрузки.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Выберите файл для загрузки.",
        variant: "destructive"
      });
      return;
    }

    const newUpload = {
      id: Date.now().toString(),
      title: formData.title,
      image: preview || "/placeholder.svg",
      type: formData.type,
      likes: 0,
      date: new Date().toLocaleDateString('ru-RU'),
      isVideo: formData.type === 'video',
      videoUrl: formData.type === 'video' ? preview : undefined
    };

    addUpload(newUpload);
    
    toast({
      title: "Контент загружен",
      description: `Ваш ${formData.type === 'video' ? 'видео' : 'фото'} успешно добавлен.`,
    });
    
    // Сброс формы
    setFormData({ title: "", type: "photo" });
    setSelectedFile(null);
    setPreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Загрузить фото/видео</DialogTitle>
          <DialogDescription>
            Поделитесь результатом работы или процессом создания дизайна
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Выберите файл</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {preview ? (
                <div className="relative">
                  {formData.type === 'video' ? (
                    <div className="relative">
                      <video 
                        src={preview} 
                        className="w-full h-40 object-cover rounded"
                        controls
                        muted
                      />
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                        <Image className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setPreview("");
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Перетащите файл или нажмите для выбора
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Поддерживаются: JPG, PNG, MP4, MOV (до 50MB)
                  </p>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file')?.click()}
                  >
                    Выбрать файл
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              placeholder="Введите название работы"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!selectedFile || !formData.title.trim()}>
              Загрузить {formData.type === 'video' ? 'видео' : 'фото'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadContentModal;

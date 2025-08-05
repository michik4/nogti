import React, { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import FileUpload from "@/components/ui/file-upload";
import { designService } from "@/services/designService";
import { getImageUrl } from "@/utils/image.util";
import { formatPrice } from "@/utils/format.util";

interface AddDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (designData: CreateDesignData, serviceId?: string) => void;
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

interface CreateDesignData {
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  type: 'basic' | 'designer';
  tags: string[];
  color?: string;
  estimatedPrice?: number;
}

const popularTags = [
  'Френч', 'Омбре', 'Градиент', 'Стразы', 'Матовый', 'Глянцевый',
  'Минимализм', 'Геометрия', 'Цветы', 'Абстракция', 'Мрамор',
  'Золото', 'Серебро', 'Нюд', 'Яркий', 'Пастель'
];

const AddDesignModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  services 
}: AddDesignModalProps) => {
  const [selectedService, setSelectedService] = useState<string>('library'); // 'library' или ID услуги
  const [formData, setFormData] = useState<CreateDesignData>({
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    type: 'basic',
    tags: [],
    color: '',
    estimatedPrice: 0
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Получаем данные выбранной услуги
  const selectedServiceData = selectedService === 'library' 
    ? null 
    : services.find(s => s.id === selectedService);
  
  // Устанавливаем цену по умолчанию при изменении услуги
  React.useEffect(() => {
    if (selectedServiceData) {
      setFormData(prev => ({ ...prev, estimatedPrice: selectedServiceData.price }));
    } else {
      setFormData(prev => ({ ...prev, estimatedPrice: 0 }));
    }
  }, [selectedServiceData]);

  const handleInputChange = (field: keyof CreateDesignData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Если изменяется imageUrl, обновляем превью
    if (field === 'imageUrl') {
      setImagePreview(value);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Введите название дизайна');
      return;
    }

    // Если выбран файл, но не загружен - загружаем
    if (selectedFile && !formData.imageUrl.trim()) {
      try {
        await handleFileUpload(selectedFile);
      } catch (error) {
        return; // Ошибка уже обработана в handleFileUpload
      }
    }

    if (!formData.imageUrl.trim()) {
      toast.error('Добавьте изображение дизайна');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData, selectedService === 'library' ? undefined : selectedService);
      
      // Сброс формы
      setSelectedService('library');
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        videoUrl: '',
        type: 'basic',
        tags: [],
        color: '',
        estimatedPrice: 0
      });
      handleClearImage();
      
      toast.success('Дизайн создан и отправлен на модерацию');
      onClose();
    } catch (error) {
      console.error('Ошибка создания дизайна:', error);
      toast.error('Не удалось создать дизайн');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const response = await designService.uploadDesignImage(file);
      if (response.success && response.data) {
        const imageUrl = response.data.imageUrl;
        setFormData(prev => ({ ...prev, imageUrl }));
        // Очищаем локальное превью и показываем загруженное изображение
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(getImageUrl(imageUrl) || '');
        setSelectedFile(null);
        toast.success('Изображение успешно загружено');
        return imageUrl;
      } else {
        throw new Error(response.error || 'Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки изображения');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClearImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Создать новый дизайн</span>
            <Button variant="ghost" size="icon" onClick={() => {
              handleClearImage();
              onClose();
            }}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Выбор привязки */}
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <RadioGroup 
                value={selectedService === 'library' ? 'library' : 'service'} 
                onValueChange={(value) => {
                  if (value === 'library') {
                    setSelectedService('library');
                  } else {
                    setSelectedService(services[0]?.id || 'library');
                  }
                }}
                className="space-y-4"
              >
                              <div className="flex items-start space-x-3">
                  <RadioGroupItem value="library" id="library" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="library" className="font-medium cursor-pointer">
                      В общую библиотеку
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Дизайн будет доступен всем мастерам после модерации
                    </p>
                  </div>
                </div>
              
              {services.length > 0 && (
                <div className="space-y-3">
                                      <div className="flex items-start space-x-3">
                      <RadioGroupItem value="service" id="service-option" className="mt-1" />
                      <div className="space-y-1">
                        <Label htmlFor="service-option" className="font-medium cursor-pointer">
                          Привязать к услуге
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Дизайн будет добавлен к выбранной услуге и сразу доступен клиентам
                        </p>
                      </div>
                    </div>
                  
                  {selectedService !== 'library' && (
                    <div className="ml-7">
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите услугу" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({formatPrice(service.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              </RadioGroup>
            </div>
          </div>

          {/* Изображение */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="imageUrl">Изображение дизайна *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={uploadMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('file')}
                >
                  Загрузить файл
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('url')}
                >
                  Ввести URL
                </Button>
              </div>
            </div>
            
            {uploadMode === 'file' ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileUpload={handleFileUpload}
                previewUrl={imagePreview}
                onPreviewClear={handleClearImage}
                loading={uploadingImage}
                disabled={loading}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            ) : (
              <div className="space-y-4">
                {imagePreview ? (
                  <Card className="p-4">
                    <div className="aspect-square relative overflow-hidden rounded-lg mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Превью дизайна"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImagePreview('');
                          toast.error('Не удалось загрузить изображение');
                        }}
                      />
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={handleClearImage}
                    >
                      Изменить изображение
                    </Button>
                  </Card>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Добавьте URL изображения дизайна
                    </p>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название дизайна *</Label>
              <Input
                id="title"
                placeholder="Например: Френч с блестками"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип дизайна</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Базовый</SelectItem>
                  <SelectItem value="designer">Дизайнерский</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Опишите особенности дизайна, технику выполнения..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          
            

            <div className="space-y-2">
              <Label htmlFor="color">Основной цвет</Label>
              <Input
                id="color"
                placeholder="Например: розовый, нюд, черный"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
            </div>
          

          {/* Видео (опционально) */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Видео (опционально)</Label>
            <Input
              id="videoUrl"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            />
          </div>

          {/* Теги */}
          <div className="space-y-4">
            <Label>Теги</Label>
            
            {/* Популярные теги */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Популярные теги:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Добавление своих тегов */}
            <div className="space-y-2">
              <Input
                placeholder="Добавить свой тег (нажмите Enter)"
                onKeyDown={handleAddCustomTag}
              />
              
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Выбранные теги:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => {
              handleClearImage();
              onClose();
            }}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Создание...' : 'Создать дизайн'}
            </Button>
          </div>

          {/* Информация о модерации */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ℹ️ <strong>Модерация:</strong> Новый дизайн будет отправлен на модерацию администратором. 
              После одобрения он станет доступен для клиентов.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDesignModal; 
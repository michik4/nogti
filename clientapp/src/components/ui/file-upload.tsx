import { useState, useRef, useCallback, DragEvent } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // в байтах
  disabled?: boolean;
  className?: string;
  previewUrl?: string;
  onPreviewClear?: () => void;
  loading?: boolean;
  uploadProgress?: number;
}

const FileUpload = ({
  onFileSelect,
  onFileUpload,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
  disabled = false,
  className = "",
  previewUrl,
  onPreviewClear,
  loading = false,
  uploadProgress = 0
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Валидация размера файла
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(`Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`);
    }

    // Валидация типа файла
    const allowedTypes = accept.split(',').map(type => type.trim());
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Недопустимый тип файла');
    }

    onFileSelect(file);

    // Если есть обработчик загрузки, вызываем его
    if (onFileUpload) {
      await onFileUpload(file);
    }
  }, [accept, maxSize, onFileSelect, onFileUpload]);

  const handleInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await handleFileSelect(file);
      } catch (error) {
        console.error('Ошибка выбора файла:', error);
        // Можно добавить toast уведомление здесь
      }
    }
    // Очищаем input для возможности повторного выбора
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      try {
        await handleFileSelect(file);
      } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        // Можно добавить toast уведомление здесь
      }
    }
  }, [disabled, handleFileSelect]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    onPreviewClear?.();
  };

  // Если есть превью изображения, показываем его
  if (previewUrl) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <img 
              src={previewUrl} 
              alt="Превью" 
              className="w-full h-full object-cover"
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Загрузка...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={handleButtonClick}
              disabled={disabled || loading}
            >
              Изменить
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={handleClearPreview}
              disabled={disabled || loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </Card>
    );
  }

  // Область drag-and-drop для загрузки
  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/40'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={!disabled ? handleButtonClick : undefined}
    >
      {loading ? (
        <div className="space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка файла...</p>
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragOver ? (
              <Upload className="w-12 h-12 text-primary" />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isDragOver 
                ? 'Отпустите для загрузки' 
                : 'Перетащите изображение сюда или нажмите для выбора'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Поддерживаемые форматы: JPEG, PNG, WebP, GIF
              <br />
              Максимальный размер: {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Выбрать файл
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload; 
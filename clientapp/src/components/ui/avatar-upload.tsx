import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/utils/image.util";
import styles from "./avatar-upload.module.css";

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
  className?: string;
}

/**
 * Компонент для загрузки и редактирования аватаров
 */
const AvatarUpload = ({ 
  currentAvatar, 
  userName, 
  onAvatarUpdate,
  size = "md",
  showUploadButton = true,
  className = ""
}: AvatarUploadProps) => {
  const { user: currentUser, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Синхронизируем локальное состояние с переданным аватаром
  useEffect(() => {
    // Обновляем локальное состояние только если currentAvatar действительно изменился
    // и отличается от локально загруженного, но не при первичной загрузке
    if (currentAvatar && currentAvatar !== uploadedAvatarUrl) {
      // Проверяем, что это не результат нашей собственной загрузки
      if (!uploadedAvatarUrl || currentAvatar !== uploadedAvatarUrl) {
        setUploadedAvatarUrl(currentAvatar);
      }
    }
  }, [currentAvatar]);

  // Получаем CSS классы в зависимости от размера
  const getAvatarSizeClass = () => {
    switch (size) {
      case "sm": return styles.avatarSm;
      case "md": return styles.avatarMd;
      case "lg": return styles.avatarLg;
      default: return styles.avatarMd;
    }
  };

  const getIconSizeClass = () => {
    switch (size) {
      case "sm": return styles.iconSm;
      case "md": return styles.iconMd;
      case "lg": return styles.iconLg;
      default: return styles.iconMd;
    }
  };

  const getButtonSizeClass = () => {
    switch (size) {
      case "sm": return styles.buttonSm;
      case "md": return styles.buttonMd;
      case "lg": return styles.buttonLg;
      default: return styles.buttonMd;
    }
  };

  const handleFileSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (5 МБ максимум)
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // 5 * 1024 * 1024 = 5242880 bytes
    
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
      
      toast.error("🚫 Файл слишком большой", {
        description: `Максимальный размер файла: ${maxSizeInMB} МБ.\nРазмер вашего файла: ${fileSizeInMB} МБ.\n\n💡 Попробуйте сжать изображение или выберите файл меньшего размера.`,
        duration: 6000,
      });
      
      console.warn(`❌ Файл отклонен: ${file.name} (${fileSizeInMB} МБ > ${maxSizeInMB} МБ)`);
      
      // Очищаем input для возможности выбора другого файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("🚫 Неподдерживаемый формат файла", {
        description: `Поддерживаются только изображения:\n• JPEG (.jpg, .jpeg)\n• PNG (.png)\n• WebP (.webp)\n• GIF (.gif)\n\nВаш файл: ${file.type || 'неизвестный тип'}`,
        duration: 6000,
      });
      
      console.warn(`❌ Неподдерживаемый тип файла: ${file.name} (${file.type})`);
      
      // Очищаем input для возможности выбора другого файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      // Создаем превью
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      setIsUploading(true);

      console.log(`📤 Загружаем файл: ${file.name}, размер: ${(file.size / 1024 / 1024).toFixed(2)} МБ, тип: ${file.type}`);

      // Загружаем аватар
      const result = await userService.updateAvatar(file);
      
      console.log('🎉 Аватар успешно загружен:', result.avatar_url);
      
      // Сохраняем новый URL локально
      setUploadedAvatarUrl(result.avatar_url);
      
      // Обновляем аватар в контексте пользователя
      if (currentUser && updateUser) {
        updateUser({
          ...currentUser,
          avatar: result.avatar_url
        });
        console.log('👤 Обновили пользователя в контексте');
      }

      // Вызываем callback если предоставлен
      onAvatarUpdate?.(result.avatar_url);

      toast.success("✅ Успех", {
        description: "Аватар успешно обновлен",
        duration: 3000,
      });

      // Очищаем превью через небольшую задержку
      setTimeout(() => {
        setPreviewUrl(null);
        URL.revokeObjectURL(fileUrl);
        console.log('🔄 Очистили превью, используем загруженный аватар из состояния');
      }, 1000);

    } catch (error) {
      console.error('❌ Ошибка загрузки аватара:', error);
      
      // Очищаем превью при ошибке
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      toast.error("❌ Ошибка", {
        description: error instanceof Error ? error.message : "Не удалось загрузить аватар",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      // Очищаем input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Приоритет отображения: превью > локально загруженный > переданный проп
  const avatarUrl = uploadedAvatarUrl || currentAvatar;
  const displayAvatar = previewUrl || getImageUrl(avatarUrl);
  const displayName = userName || currentUser?.email || '?';

  console.log('🖼️ AvatarUpload render:', {
    previewUrl: !!previewUrl,
    uploadedAvatarUrl,
    currentAvatar,
    avatarUrl,
    displayAvatar,
    isUploading,
    priority: previewUrl ? 'preview' : uploadedAvatarUrl ? 'uploaded' : 'current'
  });

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Аватар */}
      <div className={styles.avatarGroup}>
        <div className={`${styles.avatar} ${getAvatarSizeClass()} ${isUploading ? styles.uploading : ''}`}>
          {displayAvatar ? (
            <img 
              src={displayAvatar} 
              alt={displayName}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Overlay с индикатором загрузки */}
        {isUploading && (
          <div className={`${styles.loadingOverlay} ${getAvatarSizeClass()}`}>
            <Loader2 className={`${getIconSizeClass()} ${styles.loading}`} />
          </div>
        )}

        {/* Кнопка камеры (показывается при hover на больших размерах) */}
        {showUploadButton && size !== "sm" && (
          <button
            onClick={handleFileSelect}
            disabled={isUploading}
            className={`${styles.hoverOverlay} ${getAvatarSizeClass()}`}
          >
            <Camera className={getIconSizeClass()} />
          </button>
        )}
      </div>

      {/* Кнопка загрузки (отдельная для малых размеров или всегда видимая) */}
      

      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
    </div>
  );
};

export default AvatarUpload; 
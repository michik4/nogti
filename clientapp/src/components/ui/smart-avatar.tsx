import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/utils/image.util";

interface SmartAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
}

/**
 * Умный аватар, который автоматически обрабатывает URL изображений
 * Преобразует относительные URL в абсолютные и обрабатывает null/undefined значения
 */
export const SmartAvatar = ({ src, alt, fallback, className }: SmartAvatarProps) => {
  const imageUrl = getImageUrl(src);
  const avatarFallback = fallback || alt?.charAt(0)?.toUpperCase() || '?';

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt={alt} />
      <AvatarFallback>{avatarFallback}</AvatarFallback>
    </Avatar>
  );
}; 
/**
 * Утилиты для работы с изображениями
 */

// Базовый URL сервера для статических файлов
const SERVER_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * Преобразует относительный URL в абсолютный для изображений
 * @param relativeUrl - относительный URL (например, "/uploads/avatars/avatar_123.jpg")
 * @returns абсолютный URL (например, "http://localhost:3000/uploads/avatars/avatar_123.jpg")
 */
export const getImageUrl = (relativeUrl?: string | null): string | undefined => {
  if (!relativeUrl) return undefined;
  
  // Если URL уже абсолютный, возвращаем как есть
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Если URL начинается с /uploads, добавляем базовый URL сервера
  if (relativeUrl.startsWith('/uploads')) {
    return `${SERVER_BASE_URL}${relativeUrl}`;
  }
    
  // Для других случаев (например, /placeholder.svg) оставляем как есть
  return relativeUrl;
};

/**
 * Проверяет, является ли URL изображением placeholder'а
 */
export const isPlaceholderImage = (url?: string | null): boolean => {
  return !url || url.includes('placeholder') || url === '/placeholder.svg';
}; 
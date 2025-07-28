/**
 * Утилиты для работы с рейтингом мастеров
 */

/**
 * Безопасно форматирует рейтинг до одного знака после запятой
 * @param rating - рейтинг (может быть числом или строкой)
 * @returns отформатированная строка с рейтингом
 */
export const formatRating = (rating: number | string | undefined | null): string => {
  const numRating = Number(rating);
  
  if (isNaN(numRating) || rating === null || rating === undefined) {
    return '0.0';
  }
  
  return numRating.toFixed(1);
};

/**
 * Получает числовое значение рейтинга
 * @param rating - рейтинг (может быть числом или строкой)
 * @returns числовое значение рейтинга или 0
 */
export const getRatingNumber = (rating: number | string | undefined | null): number => {
  const numRating = Number(rating);
  
  if (isNaN(numRating) || rating === null || rating === undefined) {
    return 0;
  }
  
  return numRating;
};

/**
 * Форматирует текст с количеством отзывов
 * @param count - количество отзывов
 * @returns правильная форма слова "отзыв"
 */
export const formatReviewsCount = (count: number): string => {
  if (count === 1) {
    return 'отзыв';
  } else if (count < 5) {
    return 'отзыва';
  } else {
    return 'отзывов';
  }
};

/**
 * Полное форматирование рейтинга с отзывами
 * @param rating - рейтинг
 * @param reviewsCount - количество отзывов
 * @returns строка вида "4.5 (23 отзыва)"
 */
export const formatRatingWithReviews = (
  rating: number | string | undefined | null, 
  reviewsCount: number
): string => {
  const formattedRating = formatRating(rating);
  const reviewsText = formatReviewsCount(reviewsCount);
  
  return `${formattedRating} (${reviewsCount} ${reviewsText})`;
}; 
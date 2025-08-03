/**
 * Форматирует цену в рубли с округлением до целого числа
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(price));
};

/**
 * Округляет число до целого
 */
export const roundPrice = (price: number): number => {
  return Math.round(price);
}; 
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

/**
 * Форматирует дату в формате день.месяц.год
 * @param dateString - строка с датой
 * @returns отформатированная дата или 'недавно' если дата невалидна
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return 'недавно';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.warn('Ошибка форматирования даты:', error);
    return 'недавно';
  }
};

/**
 * Форматирует дату и время в формате день.месяц.год час:минута
 * @param dateString - строка с датой
 * @returns отформатированная дата и время
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return 'недавно';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (error) {
    console.warn('Ошибка форматирования даты и времени:', error);
    return 'недавно';
  }
}; 
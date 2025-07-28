// Карта соответствий названий цветов и их hex-кодов
const COLOR_MAP: { [key: string]: string } = {
  'красный': '#FF0000',
  'розовый': '#FFC0CB',
  'оранжевый': '#FFA500',
  'желтый': '#FFFF00',
  'зеленый': '#32CD32',
  'голубой': '#87CEEB',
  'синий': '#0000FF',
  'фиолетовый': '#800080',
  'черный': '#000000',
  'белый': '#FFFFFF',
  'серый': '#808080',
  'коричневый': '#8B4513',
  'золотой': '#FFD700',
  'серебряный': '#C0C0C0',
  'бежевый': '#F5F5DC',
  'нюдовый': '#FDBCB4'
};

// Доступные цвета для фильтрации
export const AVAILABLE_COLORS = [
  { name: 'Красный', value: 'красный', hex: '#FF0000' },
  { name: 'Розовый', value: 'розовый', hex: '#FFC0CB' },
  { name: 'Оранжевый', value: 'оранжевый', hex: '#FFA500' },
  { name: 'Желтый', value: 'желтый', hex: '#FFFF00' },
  { name: 'Зеленый', value: 'зеленый', hex: '#32CD32' },
  { name: 'Голубой', value: 'голубой', hex: '#87CEEB' },
  { name: 'Синий', value: 'синий', hex: '#0000FF' },
  { name: 'Фиолетовый', value: 'фиолетовый', hex: '#800080' },
  { name: 'Черный', value: 'черный', hex: '#000000' },
  { name: 'Белый', value: 'белый', hex: '#FFFFFF' },
  { name: 'Серый', value: 'серый', hex: '#808080' },
  { name: 'Коричневый', value: 'коричневый', hex: '#8B4513' },
  { name: 'Золотой', value: 'золотой', hex: '#FFD700' },
  { name: 'Серебряный', value: 'серебряный', hex: '#C0C0C0' },
  { name: 'Бежевый', value: 'бежевый', hex: '#F5F5DC' },
  { name: 'Нюдовый', value: 'нюдовый', hex: '#FDBCB4' },
];

/**
 * Получает hex-код цвета по его названию
 * @param colorName - название цвета (например, "красный")
 * @returns hex-код цвета или исходное значение, если цвет не найден
 */
export const getColorHex = (colorName: string): string => {
  if (!colorName) return '#000000';
  return COLOR_MAP[colorName.toLowerCase()] || colorName;
};

/**
 * Получает название цвета по его hex-коду
 * @param hexCode - hex-код цвета (например, "#FF0000")
 * @returns название цвета или исходное значение, если цвет не найден
 */
export const getColorName = (hexCode: string): string => {
  if (!hexCode) return '';
  
  const entry = Object.entries(COLOR_MAP).find(([, hex]) => hex.toLowerCase() === hexCode.toLowerCase());
  return entry ? entry[0] : hexCode;
};

/**
 * Проверяет, является ли значение допустимым цветом
 * @param color - значение цвета
 * @returns true, если цвет допустим
 */
export const isValidColor = (color: string): boolean => {
  if (!color) return false;
  return COLOR_MAP.hasOwnProperty(color.toLowerCase()) || /^#[0-9A-Fa-f]{6}$/.test(color);
}; 
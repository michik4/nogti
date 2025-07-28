/**
 * Утилита для генерации случайных спокойных градиентных фонов
 */

const calmColorPalettes = [
  // Спокойные голубые тона
  ['#e0f2fe', '#b3e5fc', '#81d4fa'],
  ['#f1f8e9', '#dcedc8', '#c5e1a5'],
  // Нежные розовые
  ['#fce4ec', '#f8bbd9', '#f48fb1'],
  // Лавандовые
  ['#f3e5f5', '#e1bee7', '#ce93d8'],
  // Мятные
  ['#e8f5e8', '#c8e6c9', '#a5d6a7'],
  // Персиковые
  ['#fff3e0', '#ffe0b2', '#ffcc80'],
  // Нежно-фиолетовые
  ['#ede7f6', '#d1c4e9', '#b39ddb'],
  // Морские
  ['#e0f7fa', '#b2ebf2', '#80deea'],
  // Кремовые
  ['#fffde7', '#fff9c4', '#fff59d'],
  // Серо-голубые
  ['#eceff1', '#cfd8dc', '#b0bec5']
];

const gradientDirections = [
  '135deg', // диагональ
  '45deg',  // обратная диагональ
  '90deg',  // вертикальный
  '180deg', // горизонтальный
  '225deg', // диагональ вниз-влево
  '315deg'  // диагональ вверх-вправо
];

/**
 * Генерирует случайный спокойный градиентный фон на основе строки (для консистентности)
 */
export const generateCalmBackground = (seed: string): string => {
  // Простая хеш-функция для получения детерминированного результата
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное число
  }
  
  const paletteIndex = Math.abs(hash) % calmColorPalettes.length;
  const directionIndex = Math.abs(hash >> 4) % gradientDirections.length;
  
  const palette = calmColorPalettes[paletteIndex];
  const direction = gradientDirections[directionIndex];
  
  // Создаем градиент из 2-3 цветов палитры
  const colorCount = 2 + (Math.abs(hash >> 8) % 2); // 2 или 3 цвета
  const selectedColors = palette.slice(0, colorCount);
  
  return `linear-gradient(${direction}, ${selectedColors.join(', ')})`;
};

/**
 * Генерирует случайный спокойный фон для мастера на основе его ID
 */
export const getMasterBackground = (masterId: string): string => {
  return generateCalmBackground(masterId);
};

/**
 * Получает контрастный цвет текста для фона
 */
export const getTextColorForBackground = (backgroundColors: string[]): string => {
  // Для спокойных светлых тонов обычно лучше подходит темный текст
  return '#374151'; // темно-серый
};

/**
 * Получает цвет для элементов на фоне
 */
export const getAccentColorForBackground = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const accentColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#6366f1', // indigo
    '#84cc16'  // lime
  ];
  
  return accentColors[Math.abs(hash >> 12) % accentColors.length];
}; 
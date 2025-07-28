/**
 * Утилиты для безопасной работы с данными мастеров
 */

/**
 * Получает имя мастера с fallback значениями
 * @param master - объект мастера
 * @returns безопасное имя мастера
 */
export const getMasterName = (master: any): string => {
  if (!master) return 'Мастер';
  return master.fullName || master.name || 'Мастер';
};

/**
 * Получает инициалы мастера
 * @param master - объект мастера
 * @returns инициалы мастера
 */
export const getMasterInitials = (master: any): string => {
  const name = getMasterName(master);
  return name.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'М';
};

/**
 * Проверяет, активен ли мастер
 * @param master - объект мастера
 * @returns true если мастер активен
 */
export const isMasterActive = (master: any): boolean => {
  return master?.isActive === true;
};

/**
 * Получает безопасный ID мастера
 * @param master - объект мастера
 * @returns ID мастера или пустую строку
 */
export const getMasterId = (master: any): string => {
  return master?.id || '';
}; 
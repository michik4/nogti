/**
 * Утилиты для шифрования гостевых данных
 * Обеспечивает безопасное хранение данных в localStorage
 */

// Простой ключ шифрования (в продакшене должен быть более сложным)
const ENCRYPTION_KEY = 'nogotochki_guest_session_2024';

/**
 * Простое шифрование строки
 */
export const encryptData = (data: string): string => {
  try {
    // Простое XOR шифрование для демонстрации
    // В реальном проекте используйте более надежные методы
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted); // Base64 кодирование
  } catch (error) {
    console.error('Ошибка шифрования:', error);
    return data; // Возвращаем исходные данные в случае ошибки
  }
};

/**
 * Расшифровка строки
 */
export const decryptData = (encryptedData: string): string => {
  try {
    const decoded = atob(encryptedData); // Base64 декодирование
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('Ошибка расшифровки:', error);
    return encryptedData; // Возвращаем исходные данные в случае ошибки
  }
};

/**
 * Безопасное сохранение данных в localStorage
 */
export const secureSetItem = (key: string, data: any): void => {
  try {
    const jsonData = JSON.stringify(data);
    const encrypted = encryptData(jsonData);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Ошибка сохранения данных:', error);
    // Fallback к обычному сохранению
    localStorage.setItem(key, JSON.stringify(data));
  }
};

/**
 * Безопасное получение данных из localStorage
 */
export const secureGetItem = (key: string): any => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Ошибка получения данных:', error);
    // Fallback к обычному получению
    const fallback = localStorage.getItem(key);
    return fallback ? JSON.parse(fallback) : null;
  }
};

/**
 * Безопасное удаление данных из localStorage
 */
export const secureRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Ошибка удаления данных:', error);
  }
}; 
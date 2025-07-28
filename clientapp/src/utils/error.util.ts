import { AuthError, AuthFieldError } from '@/types/api.types';

/**
 * Парсит ошибку API и преобразует в структурированный формат
 */
export const parseAuthError = (error: any): AuthError => {
  let code: AuthError['code'] = 'UNKNOWN_ERROR';
  let message = 'Произошла неизвестная ошибка';
  let field: string | undefined;

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object') {
    // Определяем тип ошибки по сообщению
    const errorMessage = error.message || error.error || '';
    
    if (errorMessage.includes('Все обязательные поля')) {
      code = 'VALIDATION_ERROR';
      message = 'Заполните все обязательные поля';
    } else if (errorMessage.includes('Неверные учетные данные')) {
      code = 'INVALID_CREDENTIALS';
      message = 'Неверный email или пароль';
    } else if (errorMessage.includes('уже существует')) {
      code = 'USER_EXISTS';
      message = 'Пользователь с таким email уже зарегистрирован';
    } else if (errorMessage.includes('Внутренняя ошибка сервера')) {
      code = 'SERVER_ERROR';
      message = 'Ошибка сервера. Попробуйте позже';
    } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      code = 'NETWORK_ERROR';
      message = 'Ошибка сети. Проверьте подключение к интернету';
    } else if (errorMessage.includes('Недопустимая роль')) {
      code = 'VALIDATION_ERROR';
      message = 'Выберите тип аккаунта';
    } else {
      message = errorMessage || message;
    }
  }

  return { code, message, field };
};

/**
 * Валидирует поля формы авторизации и возвращает ошибки
 */
export const validateAuthForm = (
  formData: {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    phone?: string;
  },
  isLogin: boolean
): AuthFieldError[] => {
  const errors: AuthFieldError[] = [];

  // Валидация email
  if (!formData.email) {
    errors.push({
      field: 'email',
      message: 'Email обязателен для заполнения'
    });
  } else if (!isValidEmail(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Введите корректный email адрес'
    });
  }

  // Валидация пароля
  if (!formData.password) {
    errors.push({
      field: 'password',
      message: 'Пароль обязателен для заполнения'
    });
  } else if (formData.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Пароль должен содержать минимум 6 символов'
    });
  }

  // Дополнительная валидация для регистрации
  if (!isLogin) {
    if (!formData.fullName) {
      errors.push({
        field: 'fullName',
        message: 'Полное имя обязательно для заполнения'
      });
    } else if (formData.fullName.length < 2) {
      errors.push({
        field: 'fullName',
        message: 'Полное имя должно содержать минимум 2 символа'
      });
    }

    // Валидация телефона (если указан)
    if (formData.phone && !isValidPhone(formData.phone)) {
      errors.push({
        field: 'phone',
        message: 'Введите корректный номер телефона'
      });
    }
  }

  return errors;
};

/**
 * Проверяет корректность email адреса
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Проверяет корректность номера телефона
 */
export const isValidPhone = (phone: string): boolean => {
  // Удаляем все символы кроме цифр и +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Проверяем российские номера: +7XXXXXXXXXX или 8XXXXXXXXXX
  const phoneRegex = /^(\+7|8)\d{10}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Форматирует номер телефона для отображения
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('8')) {
    // Заменяем 8 на +7
    const formattedPhone = '+7' + cleanPhone.slice(1);
    return formattedPhone.replace(/(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('7')) {
    // Добавляем + если его нет
    const formattedPhone = '+' + cleanPhone;
    return formattedPhone.replace(/(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
  }
  
  return phone;
}; 
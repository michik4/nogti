import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { authService } from '@/services/authService';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api.types';
import { User, Client, Master, Admin, Guest } from '@/types/user.types';
import { secureSetItem, secureGetItem, secureRemoveItem } from '@/utils/encryption.util';

interface AuthContextType {
  // Состояние аутентификации
  user: User | Guest | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Методы аутентификации
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;

  // Гостевые сессии
  createGuestSession: (sessionDuration?: number) => Guest;
  convertGuestToUser: (userType: 'client' | 'nailmaster', userData: Partial<RegisterRequest>) => Promise<void>;
  
  // Локальные возможности для гостевых пользователей
  updateGuestData: (data: Partial<Guest>) => void;
  clearGuestSession: () => void;
  getGuestSession: () => Guest | null;
  getGuestSessionTimeLeft: () => number; // Время жизни сессии в миллисекундах

  // Проверки ролей
  isClient: () => boolean;
  isMaster: () => boolean;
  isAdmin: () => boolean;
  isGuest: () => boolean;

  // Обновление профиля
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User | Guest>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Инициализация при загрузке приложения
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Инициализация аутентификации
   */
  const initializeAuth = async () => {
    // Предотвращаем множественные одновременные инициализации
    if (isInitializing) {
      return;
    }

    try {
      setIsInitializing(true);
      setIsLoading(true);

      // Проверяем, есть ли действующий токен
      if (authService.isAuthenticated()) {
        try {
          // ПРИОРИТЕТ: Получаем актуальные данные с сервера
          const profile = await authService.getProfile();
          
          console.log('Профиль загружен с сервера:', profile);
          setUser(profile);
          // Удаляем гостевую сессию при успешной аутентификации
          clearGuestSession();
        } catch (error) {
          console.error('Ошибка загрузки профиля с сервера:', error);
          
          // Проверяем, не истек ли токен
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.warn('Токен истек или недействителен, очищаем');
            authService.logout();
            checkGuestSession();
            return;
          }
          
          // FALLBACK: Только если сервер недоступен, используем данные из токена
          // Но предупреждаем о возможных проблемах с кодировкой
          try {
            const currentUserFromToken = authService.getCurrentUser();
            
            if (currentUserFromToken) {
              console.warn('Используются данные из JWT токена. Кириллические символы могут отображаться некорректно.');
              console.warn('Попробуйте обновить страницу для повторной загрузки с сервера.');
              setUser(currentUserFromToken);
              clearGuestSession();
              
              // Попытаемся обновить данные в фоне
              setTimeout(async () => {
                try {
                  const freshProfile = await authService.getProfile();
                  console.log('Профиль обновлен в фоне:', freshProfile);
                  setUser(freshProfile);
                } catch (retryError) {
                  console.warn('Не удалось обновить профиль в фоне:', retryError);
                }
              }, 2000);
            } else {
              // Токен есть, но декодировать не удалось - очищаем
              console.error('Не удалось декодировать данные пользователя из токена');
              authService.logout();
              checkGuestSession();
            }
          } catch (tokenError) {
            console.error('Ошибка обработки токена:', tokenError);
            authService.logout();
            checkGuestSession();
          }
        }
      } else {
        // Проверяем гостевую сессию
        checkGuestSession();
      }
    } catch (error) {
      console.error('Ошибка инициализации аутентификации:', error);
      authService.logout();
      checkGuestSession();
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  /**
   * Очистка гостевой сессии
   */
  const clearGuestSession = () => {
    secureRemoveItem('guestSession');
  };

  /**
   * Миграция старых гостевых данных в новый формат
   */
  const migrateOldGuestData = (): void => {
    try {
      // Проверяем, есть ли старые данные в localStorage
      const oldData = localStorage.getItem('guestSession');
      if (oldData) {
        try {
          const parsedData = JSON.parse(oldData);
          // Если данные успешно распарсились, но не содержат sessionDuration, 
          // значит это старые данные - пересохраняем в новом формате
          if (parsedData && typeof parsedData === 'object' && parsedData.id && !parsedData.sessionDuration) {
            console.log('Мигрируем старые данные гостевой сессии');
            const migratedData = {
              ...parsedData,
              sessionDuration: 24 * 60 * 60 * 1000 // Добавляем время жизни по умолчанию
            };
            secureSetItem('guestSession', migratedData);
          }
        } catch (parseError) {
          console.warn('Не удалось распарсить старые данные гостевой сессии');
        }
      }
    } catch (error) {
      console.error('Ошибка миграции гостевых данных:', error);
    }
  };

  /**
   * Получение текущей гостевой сессии
   */
  const getGuestSession = (): Guest | null => {
    // Сначала пытаемся мигрировать старые данные
    migrateOldGuestData();
    
    const savedGuestSession = secureGetItem('guestSession');
    if (savedGuestSession) {
      try {
        const guestUser = savedGuestSession;
        
        // Проверяем, что это действительно объект гостевой сессии
        if (!guestUser || typeof guestUser !== 'object' || !guestUser.id) {
          console.warn('Некорректные данные гостевой сессии, очищаем');
          clearGuestSession();
          return null;
        }
        
        // Проверяем, что сессия не старше установленного времени
        const sessionAge = Date.now() - new Date(guestUser.createdAt).getTime();
        const sessionDuration = guestUser.sessionDuration || 24 * 60 * 60 * 1000; // По умолчанию 24 часа

        if (sessionAge < sessionDuration) {
          return guestUser;
        } else {
          console.log('Гостевая сессия истекла, очищаем');
          clearGuestSession();
        }
      } catch (error) {
        console.error('Ошибка обработки гостевой сессии:', error);
        clearGuestSession();
      }
    }
    return null;
  };

  /**
   * Получение времени оставшегося жизни гостевой сессии
   */
  const getGuestSessionTimeLeft = (): number => {
    const guestSession = getGuestSession();
    if (guestSession) {
      const sessionAge = Date.now() - new Date(guestSession.createdAt).getTime();
      const sessionDuration = guestSession.sessionDuration || 24 * 60 * 60 * 1000; // По умолчанию 24 часа
      return Math.max(0, sessionDuration - sessionAge);
    }
    return 0;
  };

  /**
   * Обновление данных гостевого пользователя
   */
  const updateGuestData = (data: Partial<Guest>) => {
    if (user && isGuest()) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      secureSetItem('guestSession', updatedUser);
    }
  };

  /**
   * Проверка сохраненной гостевой сессии
   */
  const checkGuestSession = () => {
    const guestSession = getGuestSession();
    if (guestSession) {
      setUser(guestSession);
    }
  };

  /**
   * Авторизация пользователя
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login(credentials);

      // Получаем пользователя из токена
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Удаляем гостевую сессию при успешной авторизации
        clearGuestSession();
      } else {
        // Если не удалось получить пользователя из токена, очищаем данные
        console.error('Не удалось получить пользователя из токена после входа');
        authService.logout();
        throw new Error('Ошибка получения данных пользователя');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      // Очищаем данные при ошибке
      authService.logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Регистрация пользователя
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.register(data);

      // Получаем пользователя из токена
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Удаляем гостевую сессию при успешной регистрации
        clearGuestSession();
      } else {
        // Если не удалось получить пользователя из токена, очищаем данные
        console.error('Не удалось получить пользователя из токена после регистрации');
        authService.logout();
        throw new Error('Ошибка получения данных пользователя');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      // Очищаем данные при ошибке
      authService.logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Выход из системы
   */
  const logout = () => {
    try {
      // Очищаем данные авторизации
      authService.logout();
      
      // Очищаем гостевую сессию
      clearGuestSession();
      
      // Очищаем состояние пользователя
      setUser(null);
      
      // Дополнительная очистка всех возможных данных пользователя из localStorage
      const keysToRemove = [
        'auth_token',
        'refresh_token', 
        'guestSession',
        'user_preferences',
        'cached_user_data'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Не удалось очистить ${key} из localStorage:`, error);
        }
      });
      
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      // В случае ошибки всё равно очищаем состояние
      setUser(null);
    }
  };

  /**
   * Создание гостевой сессии
   */
  const createGuestSession = (sessionDuration?: number): Guest => {
    // Генерируем более безопасный ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const guestId = `guest_${timestamp}_${randomId}`;
    
    // Генерируем случайное имя гостя
    const guestNames = ['Анна', 'Мария', 'Елена', 'Ольга', 'Татьяна', 'Ирина', 'Наталья', 'Светлана'];
    const randomName = guestNames[Math.floor(Math.random() * guestNames.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    const guestUser: Guest = {
      id: guestId,
      name: `${randomName} ${randomNumber}`,
      email: '',
      phone: '',
      avatar: '/placeholder.svg',
      type: 'guest',
      location: 'Москва',
      joinDate: new Date().toLocaleDateString('ru-RU'),
      sessionId: `session_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isTemporary: true,
      sessionDuration: sessionDuration || 24 * 60 * 60 * 1000 // Устанавливаем время жизни по умолчанию
    };

    setUser(guestUser);
    secureSetItem('guestSession', guestUser);

    return guestUser;
  };

  /**
   * Преобразование гостевого аккаунта в постоянный
   */
  const convertGuestToUser = async (userType: 'client' | 'nailmaster', userData: Partial<RegisterRequest>): Promise<void> => {
    if (!user || !isGuest()) return;

    // Проверяем обязательные поля
    if (!userData.email || !userData.password || !userData.phone) {
      throw new Error('Не все обязательные поля заполнены');
    }

    const guestUser = user as Guest;
    const registerData: RegisterRequest = {
      email: userData.email,
      username: userData.username || userData.email,
      password: userData.password,
      role: userType,
      fullName: userData.fullName || guestUser.name,
      phone: userData.phone
    };

    try {
      await register(registerData);
      // Успешная регистрация автоматически очистит гостевую сессию
    } catch (error) {
      console.error('Ошибка конвертации гостевого аккаунта:', error);
      throw error; // Пробрасываем ошибку для обработки в UI
    }
  };

  /**
   * Обновление информации о пользователе
   */
  const refreshUser = async (): Promise<void> => {
    if (!authService.isAuthenticated()) return;

    try {
      // ПРИОРИТЕТ: Всегда пытаемся получить свежие данные с сервера
      const profile = await authService.getProfile();
      console.log('Профиль обновлен с сервера:', profile);
      setUser(profile);
      // Удаляем гостевую сессию при обновлении пользователя
      clearGuestSession();
    } catch (error) {
      console.error('Ошибка обновления пользователя с сервера:', error);
      
      // МИНИМАЛЬНЫЙ FALLBACK: Используем JWT только в крайнем случае
      // и только если текущий пользователь отсутствует
      if (!user) {
        console.warn('Попытка загрузки данных из JWT токена как fallback');
        try {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            console.warn('Данные загружены из JWT. Возможны проблемы с кодировкой кириллических символов.');
            setUser(currentUser);
            clearGuestSession();
          }
        } catch (tokenError) {
          console.error('Fallback на JWT также не удался:', tokenError);
        }
      } else {
        console.warn('Сохраняем текущие данные пользователя, так как сервер недоступен');
      }
      
      // Не выбрасываем ошибку, чтобы не нарушать работу приложения
    }
  };

  /**
   * Обновление данных пользователя
   */
  const updateUser = (userData: Partial<User | Guest>) => {
    if (user) {
      setUser(prevUser => ({ ...prevUser, ...userData }));
    }
  };

  // Проверки ролей и типов
  const isAuthenticated = useMemo(() => {
    try {
      // Если у нас есть пользователь, считаем что аутентификация есть
      if (user) {
        return true;
      }
      // Иначе проверяем токен
      return authService.isAuthenticated();
    } catch (error) {
      console.error('Ошибка проверки аутентификации в контексте:', error);
      return false;
    }
  }, [user]);
  const isClient = () => user && 'role' in user ? user.role === 'client' : false;
  const isMaster = () => user && 'role' in user ? user.role === 'nailmaster' : false;
  const isAdmin = () => user && 'role' in user ? user.role === 'admin' : false;
  const isGuest = () => {
    // Проверяем как поле type (для локальных гостевых сессий), так и isGuest (для серверных данных)
    return user && (
      ('type' in user && user.type === 'guest') ||
      ('isGuest' in user && user.isGuest === true)
    );
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    createGuestSession,
    convertGuestToUser,
    updateGuestData,
    clearGuestSession,
    getGuestSession,
    getGuestSessionTimeLeft,
    isClient,
    isMaster,
    isAdmin,
    isGuest,
    refreshUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
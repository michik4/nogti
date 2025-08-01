import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/api.type';

export class JwtUtil {
    private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    private static readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY || '1h';
    private static readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

    /**
     * Создает access токен
     */
    static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
        // Очищаем payload от потенциально проблемных значений
        const cleanPayload: Record<string, any> = { ...payload };
        
        // Убеждаемся, что все строковые значения корректно закодированы
        Object.keys(cleanPayload).forEach(key => {
            if (typeof cleanPayload[key] === 'string') {
                // Нормализуем UTF-8 строки и убираем проблемные символы
                let value = (cleanPayload[key] as string).trim();
                
                // Проверяем, что строка содержит только валидные UTF-8 символы
                if (value && !/^\s*$/.test(value)) {
                    // Нормализуем Unicode символы
                    value = value.normalize('NFC');
                    
                    // Проверяем, что строка не содержит некорректных символов
                    try {
                        // Пробуем закодировать и декодировать для проверки валидности
                        const testEncoding = encodeURIComponent(value);
                        const testDecoding = decodeURIComponent(testEncoding);
                        
                        if (testDecoding === value) {
                            cleanPayload[key] = value;
                        } else {
                            console.warn(`Некорректные символы в поле ${key}, очищаем`);
                            cleanPayload[key] = undefined;
                        }
                    } catch (error) {
                        console.warn(`Ошибка кодирования поля ${key}:`, error);
                        cleanPayload[key] = undefined;
                    }
                } else {
                    cleanPayload[key] = undefined;
                }
            }
        });
        
        return jwt.sign(cleanPayload, this.ACCESS_TOKEN_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        } as jwt.SignOptions);
    }

    /**
     * Создает refresh токен
     */
    static generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
        // Очищаем payload от потенциально проблемных значений
        const cleanPayload: Record<string, any> = { ...payload };
        
        // Убеждаемся, что все строковые значения корректно закодированы
        Object.keys(cleanPayload).forEach(key => {
            if (typeof cleanPayload[key] === 'string') {
                // Нормализуем UTF-8 строки и убираем проблемные символы
                let value = (cleanPayload[key] as string).trim();
                
                // Проверяем, что строка содержит только валидные UTF-8 символы
                if (value && !/^\s*$/.test(value)) {
                    // Нормализуем Unicode символы
                    value = value.normalize('NFC');
                    
                    // Проверяем, что строка не содержит некорректных символов
                    try {
                        // Пробуем закодировать и декодировать для проверки валидности
                        const testEncoding = encodeURIComponent(value);
                        const testDecoding = decodeURIComponent(testEncoding);
                        
                        if (testDecoding === value) {
                            cleanPayload[key] = value;
                        } else {
                            console.warn(`Некорректные символы в поле ${key}, очищаем`);
                            cleanPayload[key] = undefined;
                        }
                    } catch (error) {
                        console.warn(`Ошибка кодирования поля ${key}:`, error);
                        cleanPayload[key] = undefined;
                    }
                } else {
                    cleanPayload[key] = undefined;
                }
            }
        });
        
        return jwt.sign(cleanPayload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
        } as jwt.SignOptions);
    }

    /**
     * Проверяет access токен
     */
    static verifyAccessToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Проверяет refresh токен
     */
    static verifyRefreshToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Извлекает токен из заголовка Authorization
     */
    static extractTokenFromHeader(authHeader: string | undefined): string | null {
        if (!authHeader) return null;
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        
        return parts[1];
    }
} 
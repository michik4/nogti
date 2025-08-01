import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { ApiResponse } from '../types/api.type';
import { AppDataSource } from '../conf/orm.conf';
import { UserEntity } from '../entities/user.entity';

export interface AuthenticatedRequest extends Request {
    user?: UserEntity;
    userId?: string;
}

export class AuthMiddleware {
    /**
     * Проверяет JWT токен в заголовке Authorization
     */
    static async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Токен не предоставлен'
                };
                res.status(401).json(response);
                return;
            }

            const token = authHeader.split(' ')[1];
            const decoded = JwtUtil.verifyAccessToken(token);
            
            console.log('[AuthMiddleware] Отладка JWT:');
            console.log('- Token (первые 20 символов):', token.substring(0, 20) + '...');
            console.log('- Decoded payload:', decoded);
            
            if (!decoded) {
                console.error('[AuthMiddleware] Токен недействителен');
                const response: ApiResponse = {
                    success: false,
                    error: 'Недействительный токен'
                };
                res.status(401).json(response);
                return;
            }

            // Проверяем обязательные поля в токене
            if (!decoded.userId || !decoded.email || !decoded.role) {
                console.error('[AuthMiddleware] Токен не содержит обязательные поля:', decoded);
                const response: ApiResponse = {
                    success: false,
                    error: 'Неполный токен'
                };
                res.status(401).json(response);
                return;
            }

            // Проверяем существование пользователя
            const userRepository = AppDataSource.getRepository(UserEntity);
            const user = await userRepository.findOne({ 
                where: { id: decoded.userId }
            });

            console.log('- User from DB:', user ? { id: user.id, email: user.email, role: user.role } : 'NOT FOUND');

            if (!user) {
                console.error('[AuthMiddleware] Пользователь не найден в БД:', decoded.userId);
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь не найден'
                };
                res.status(401).json(response);
                return;
            }

            // Проверяем соответствие данных в токене и БД
            if (user.email !== decoded.email || user.role !== decoded.role) {
                console.error('[AuthMiddleware] Несоответствие данных токена и БД:', {
                    tokenEmail: decoded.email,
                    dbEmail: user.email,
                    tokenRole: decoded.role,
                    dbRole: user.role
                });
                const response: ApiResponse = {
                    success: false,
                    error: 'Данные токена не соответствуют пользователю'
                };
                res.status(401).json(response);
                return;
            }

            req.user = user;
            req.userId = user.id;
            
            // Также устанавливаем данные в req для совместимости
            (req as any).user = {
                userId: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                fullName: (user as any).fullName,
                phone: (user as any).phone
            };
            
            console.log('- Установленный req.userId:', req.userId);
            console.log('- Тип req.userId:', typeof req.userId);
            console.log('- Установленные данные пользователя:', (req as any).user);
            
            next();
        } catch (error) {
            console.error('Ошибка аутентификации:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Ошибка аутентификации'
            };
            res.status(401).json(response);
        }
    }

    /**
     * Проверяет, что пользователь имеет указанную роль
     */
    static requireRole(...roles: string[]) {
        return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
            if (!req.user) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь не аутентифицирован'
                };
                res.status(401).json(response);
                return;
            }

            if (!roles.includes(req.user.role)) {
                const response: ApiResponse = {
                    success: false,
                    error: `Недостаточно прав доступа. Требуется роль(-и) ${roles}, роль пользователя: ${req.user.role}`
                };
                res.status(403).json(response);
                return;
            }

            next();
        };
    }

    /**
     * Опциональная аутентификация - не требует токен, но проверяет его если есть
     */
    static async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);
            
            if (token) {
                const payload = JwtUtil.verifyAccessToken(token);
                if (payload) {
                    const userRepository = AppDataSource.getRepository(UserEntity);
                    const user = await userRepository.findOne({ 
                        where: { id: payload.userId }
                    });
                    if (user) {
                        req.user = user;
                        req.userId = user.id;
                    }
                }
            }

            next();
        } catch (error) {
            // Игнорируем ошибки для опциональной аутентификации
            next();
        }
    }
} 
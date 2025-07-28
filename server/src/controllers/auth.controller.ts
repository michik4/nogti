import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../conf/orm.conf';
import { UserEntity, Role } from '../entities/user.entity';
import { ClientEntity } from '../entities/client.entity';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { AdminEntity } from '../entities/admin.entity';
import { JwtUtil } from '../utils/jwt.util';
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../types/api.type';

interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

export class AuthController {
    /**
     * Регистрация нового пользователя
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, username, password, role, fullName, phone }: RegisterRequest = req.body;

            // Валидация данных
            if (!email || !username || !password || !role) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Все обязательные поля должны быть заполнены'
                };
                res.status(400).json(response);
                return;
            }

            if (!['client', 'nailmaster', 'admin'].includes(role)) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недопустимая роль пользователя'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем существование пользователя
            const userRepository = AppDataSource.getRepository(UserEntity);
            const existingUser = await userRepository.findOne({
                where: [
                    { email },
                    { username }
                ]
            });

            if (existingUser) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь с таким email или username уже существует'
                };
                res.status(409).json(response);
                return;
            }

            // Создаем пользователя в зависимости от роли
            let newUser: UserEntity;

            if (role === 'client') {
                const clientRepository = AppDataSource.getRepository(ClientEntity);
                const client = new ClientEntity();
                client.email = email;
                client.username = username;
                client.password = password; // Пароль будет захеширован автоматически в @BeforeInsert
                client.role = Role.CLIENT;
                client.isGuest = false;
                client.fullName = fullName;
                client.phone = phone;

                newUser = await clientRepository.save(client);
            } else if (role === 'nailmaster') {
                const masterRepository = AppDataSource.getRepository(NailMasterEntity);
                const master = new NailMasterEntity();
                master.email = email;
                master.username = username;
                master.password = password; // Пароль будет захеширован автоматически в @BeforeInsert
                master.role = Role.NAILMASTER;
                master.isGuest = false;
                master.fullName = fullName || '';
                master.phone = phone || '';

                newUser = await masterRepository.save(master);
            } else { // admin
                const adminRepository = AppDataSource.getRepository(AdminEntity);
                const admin = new AdminEntity();
                admin.email = email;
                admin.username = username;
                admin.password = password; // Пароль будет захеширован автоматически в @BeforeInsert
                admin.role = Role.ADMIN;
                admin.isGuest = false;
                admin.fullName = fullName || 'Администратор';
                admin.phone = phone || '';
                admin.permissions = ['*']; // Полные права по умолчанию
                admin.isActive = true;

                newUser = await adminRepository.save(admin);
            }

            // Генерируем токены
            const tokenPayload = {
                userId: newUser.id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                isGuest: newUser.isGuest,
                fullName: (newUser as any).fullName ? Buffer.from((newUser as any).fullName, 'utf8').toString('base64') : undefined,
                phone: (newUser as any).phone
            };

            const accessToken = JwtUtil.generateAccessToken(tokenPayload);
            const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

            const authResponse: AuthResponse = {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    role: newUser.role,
                    fullName: (newUser as any).fullName,
                    isGuest: newUser.isGuest
                },
                token: accessToken,
                refreshToken: refreshToken
            };

            const response: ApiResponse<AuthResponse> = {
                success: true,
                data: authResponse,
                message: 'Регистрация прошла успешно'
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }


    /**
     * Регистрация гостя
     */
    static async registerGuest(req: Request, res: Response): Promise<void> {
        try {
            const role: string = 'client';
            const { email, phone, password }: RegisterRequest = req.body;

            const userRepository = AppDataSource.getRepository(UserEntity);
            const existingUser = await userRepository.findOne({
                where: { email }
            });

            if (existingUser) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь с таким email уже существует'
                };
                res.status(409).json(response);
                return;
            }
        } catch (error) {
            console.error('Ошибка регистрации гостя:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Авторизация пользователя
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, phone, password }: LoginRequest = req.body;

            if (!password || (!email && !phone)) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Email/телефон и пароль обязательны'
                };
                res.status(400).json(response);
                return;
            }

            // Ищем пользователя по email или телефону
            const userRepository = AppDataSource.getRepository(UserEntity);
            let whereCondition: any = {};

            if (email) {
                whereCondition.email = email;
            } else if (phone) {
                // Для поиска по телефону нужно проверить ClientEntity и NailMasterEntity
                const clientRepository = AppDataSource.getRepository(ClientEntity);
                const masterRepository = AppDataSource.getRepository(NailMasterEntity);
                
                const client = await clientRepository.findOne({ where: { phone } });
                const master = await masterRepository.findOne({ where: { phone } });
                
                const user = client || master;
                if (!user) {
                    const response: ApiResponse = {
                        success: false,
                        error: 'Неверные учетные данные'
                    };
                    res.status(401).json(response);
                    return;
                }

                // Проверяем пароль
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    const response: ApiResponse = {
                        success: false,
                        error: 'Неверные учетные данные'
                    };
                    res.status(401).json(response);
                    return;
                }

                await AuthController.generateTokensAndRespond(user, res);
                return;
            }

            const user = await userRepository.findOne({ where: whereCondition });
            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Неверные учетные данные'
                };
                res.status(401).json(response);
                return;
            }

            // Проверяем пароль
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Неверные учетные данные'
                };
                res.status(401).json(response);
                return;
            }

            await AuthController.generateTokensAndRespond(user, res);
        } catch (error) {
            console.error('Ошибка входа:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Обновление токена
     */
    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Refresh токен не предоставлен'
                };
                res.status(400).json(response);
                return;
            }

            const payload = JwtUtil.verifyRefreshToken(refreshToken);
            if (!payload) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недействительный refresh токен'
                };
                res.status(401).json(response);
                return;
            }

            // Проверяем существование пользователя
            const userRepository = AppDataSource.getRepository(UserEntity);
            const user = await userRepository.findOne({ 
                where: { id: payload.userId }
            });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь не найден'
                };
                res.status(401).json(response);
                return;
            }

            // Генерируем новые токены
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            };

            const newAccessToken = JwtUtil.generateAccessToken(tokenPayload);
            const newRefreshToken = JwtUtil.generateRefreshToken(tokenPayload);

            const response: ApiResponse = {
                success: true,
                data: {
                    token: newAccessToken,
                    refreshToken: newRefreshToken
                },
                message: 'Токены обновлены'
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка обновления токена:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Вспомогательный метод для генерации токенов и отправки ответа
     */
    private static async generateTokensAndRespond(user: UserEntity, res: Response): Promise<void> {
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            isGuest: user.isGuest,
            fullName: (user as any).fullName, // Убираем base64 кодирование - современные системы корректно работают с UTF-8
            phone: (user as any).phone,
            avatar: (user as any).avatar
        };

        const accessToken = JwtUtil.generateAccessToken(tokenPayload);
        const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

        const authResponse: AuthResponse = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                fullName: (user as any).fullName,
                isGuest: user.isGuest,
                avatar: (user as any).avatar
            },
            token: accessToken,
            refreshToken: refreshToken
        };

        const response: ApiResponse<AuthResponse> = {
            success: true,
            data: authResponse,
            message: 'Вход выполнен успешно'
        };

        res.json(response);
    }

    /**
     * Регистрация администратора (специальный метод)
     */
    static async registerAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { email, username, password, fullName, phone, adminSecret }: RegisterRequest & { adminSecret: string } = req.body;

            // Проверяем секретный ключ для регистрации админа
            const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET || 'admin_secret_key_2024';
            if (adminSecret !== expectedSecret) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Неверный секретный ключ для регистрации администратора'
                };
                res.status(403).json(response);
                return;
            }

            // Валидация данных
            if (!email || !username || !password || !fullName || !phone) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Все поля обязательны для регистрации администратора'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем существование пользователя
            const userRepository = AppDataSource.getRepository(UserEntity);
            const existingUser = await userRepository.findOne({
                where: [
                    { email },
                    { username }
                ]
            });

            if (existingUser) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь с таким email или username уже существует'
                };
                res.status(409).json(response);
                return;
            }

            // Создаем администратора
            const adminRepository = AppDataSource.getRepository(AdminEntity);
            const admin = new AdminEntity();
            admin.email = email;
            admin.username = username;
            admin.password = password; // Пароль будет захеширован автоматически в @BeforeInsert
            admin.role = Role.ADMIN;
            admin.isGuest = false;
            admin.fullName = fullName;
            admin.phone = phone;
            admin.permissions = ['*']; // Полные права
            admin.isActive = true;

            const newAdmin = await adminRepository.save(admin);

            // Генерируем токены
            const tokenPayload = {
                userId: newAdmin.id,
                email: newAdmin.email,
                username: newAdmin.username,
                role: newAdmin.role,
                isGuest: newAdmin.isGuest,
                fullName: newAdmin.fullName ? Buffer.from(newAdmin.fullName, 'utf8').toString('base64') : undefined,
                phone: newAdmin.phone
            };

            const accessToken = JwtUtil.generateAccessToken(tokenPayload);
            const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

            const authResponse: AuthResponse = {
                user: {
                    id: newAdmin.id,
                    email: newAdmin.email,
                    username: newAdmin.username,
                    role: newAdmin.role,
                    fullName: newAdmin.fullName,
                    isGuest: newAdmin.isGuest
                },
                token: accessToken,
                refreshToken: refreshToken
            };

            const response: ApiResponse<AuthResponse> = {
                success: true,
                data: authResponse,
                message: 'Администратор успешно зарегистрирован'
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Ошибка регистрации администратора:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Получение профиля пользователя
     */
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const role = (req as any).user.role;

            let repository;
            switch (role) {
                case Role.CLIENT:
                    repository = AppDataSource.getRepository(ClientEntity);
                    break;
                case Role.NAILMASTER:
                    repository = AppDataSource.getRepository(NailMasterEntity);
                    break;
                case Role.ADMIN:
                    repository = AppDataSource.getRepository(AdminEntity);
                    break;
                default:
                    repository = AppDataSource.getRepository(UserEntity);
            }

            const user = await repository.findOne({
                where: { id: userId }
            });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Удаляем пароль из ответа
            const { password, ...userWithoutPassword } = user;

            const response: ApiResponse = {
                success: true,
                data: userWithoutPassword
            };

            res.json(response);
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    /**
     * Обновление аватара пользователя
     */
    static async updateAvatar(req: RequestWithFile, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            
            if (!req.file) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Файл аватара не предоставлен'
                };
                res.status(400).json(response);
                return;
            }

            console.log('[AuthController] updateAvatar для пользователя:', userId);
            console.log('[AuthController] файл:', req.file);

            // Проверяем, что пользователь существует
            const userRepository = AppDataSource.getRepository(UserEntity);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Пользователь не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Проверяем тип файла
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF'
                };
                res.status(400).json(response);
                return;
            }

            // Проверяем размер файла (максимум 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (req.file.size > maxSize) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Файл слишком большой. Максимальный размер: 5MB'
                };
                res.status(400).json(response);
                return;
            }

            // Формируем путь для сохранения файла
            const fileExtension = req.file.mimetype.split('/')[1];
            const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`;
            const avatarUrl = `/uploads/avatars/${fileName}`;

            // Сохраняем файл (в реальном приложении здесь была бы интеграция с облачным хранилищем)
            const fs = require('fs');
            const path = require('path');
            
            // Создаем директорию если её нет
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Сохраняем файл
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);

            console.log('[AuthController] ✅ Файл сохранен:', filePath);
            console.log('[AuthController] 🌐 URL аватара:', avatarUrl);
            console.log('[AuthController] 📏 Размер файла:', req.file.buffer.length, 'байт');

            // Обновляем аватар пользователя в базе данных
            await userRepository.update(userId, { avatar_url: avatarUrl });

            // Получаем обновленного пользователя
            const updatedUser = await userRepository.findOne({ where: { id: userId } });

            const response: ApiResponse<{ avatar_url: string }> = {
                success: true,
                data: { avatar_url: avatarUrl },
                message: 'Аватар успешно обновлен'
            };

            res.status(200).json(response);

        } catch (error) {
            console.error('Ошибка обновления аватара:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }
} 
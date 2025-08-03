import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { ClientController } from "../controllers/client.controller";
import { AuthMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';

// Настройка multer для загрузки файлов в память
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/register-admin', AuthController.registerAdmin);
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);

// Роут для обновления профиля
router.put('/profile', AuthMiddleware.authenticate, AuthController.updateProfile);

// Роут для обновления аватара
router.put('/avatar', AuthMiddleware.authenticate, upload.single('avatar'), AuthController.updateAvatar);

// Роуты для клиентов
router.get('/client/stats', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), ClientController.getClientStats);

export { router as AuthRouter };
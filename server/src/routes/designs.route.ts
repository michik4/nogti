import { Router, Request, Response } from 'express';
import { NailDesignController } from '../controllers/nail-design.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';

// Настройка multer для загрузки изображений дизайнов
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB для дизайнов
    }
});

const router = Router();

/**
 * GET /api/designs/search
 * Поиск дизайнов по названию или описанию
 */
router.get('/search', AuthMiddleware.optionalAuth, (req: Request, res: Response) => NailDesignController.searchDesigns(req as any, res));

/**
 * GET /api/designs/popular
 * Получить популярные дизайны
 */
router.get('/popular', (req: Request, res: Response) => NailDesignController.getPopularDesigns(req, res));

/**
 * GET /api/designs/liked
 * Получить понравившиеся дизайны пользователя
 */
router.get('/liked', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), (req: Request, res: Response) => NailDesignController.getUserLikedDesigns(req, res));

/**
 * GET /api/designs/admin/all
 * Получить все дизайны для админа (включая немодерированные)
 */
router.get('/admin/all', AuthMiddleware.authenticate, AuthMiddleware.requireRole('admin'), NailDesignController.getAllDesignsForAdmin);

/**
 * GET /api/designs
 * Получить все дизайны
 */
router.get('/', AuthMiddleware.optionalAuth, NailDesignController.getDesigns);

/**
 * GET /api/designs/:id
 * Получить дизайн по ID
 */
router.get('/:id', AuthMiddleware.optionalAuth, NailDesignController.getDesignById);

/**
 * GET /api/designs/:id/like-status
 * Проверить статус лайка для дизайна
 */
router.get('/:id/like-status', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), (req: Request, res: Response) => NailDesignController.checkLikeStatus(req, res));

/**
 * GET /api/designs/:id/masters
 * Получить мастеров, которые могут выполнить дизайн
 */
router.get('/:id/masters', AuthMiddleware.optionalAuth, NailDesignController.getMastersForDesign);

/**
 * GET /api/designs/master/:masterId
 * Получить дизайны мастера
 */
router.get('/master/:masterId', AuthMiddleware.optionalAuth, (req, res) => NailDesignController.getMasterDesigns(req as any, res));

/**
 * POST /api/designs/upload-image
 * Загрузить изображение для дизайна
 */
router.post('/upload-image', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client', 'nailmaster'), upload.single('image'), NailDesignController.uploadDesignImage);

/**
 * POST /api/designs
 * Создать новый дизайн
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client', 'nailmaster'), NailDesignController.createDesign);

/**
 * POST /api/designs/:id/like
 * Лайкнуть/убрать лайк с дизайна
 */
router.post('/:id/like', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), NailDesignController.likeDesign);

/**
 * PUT /api/designs/:id
 * Обновление дизайна (только для админа или автора)
 */
router.put('/:id', AuthMiddleware.authenticate, (req: Request, res: Response) => NailDesignController.updateDesign(req as any, res));

/**
 * PUT /api/designs/:id/moderate
 * Модерировать дизайн (одобрить/отклонить)
 */
router.put('/:id/moderate', AuthMiddleware.authenticate, AuthMiddleware.requireRole('admin'), NailDesignController.moderateDesign);

/**
 * DELETE /api/designs/:id/like
 * Убрать лайк с дизайна (альтернативный способ)
 */
router.delete('/:id/like', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), NailDesignController.likeDesign);

/**
 * DELETE /api/designs/:id
 * Удаление дизайна (только для админа или автора)
 */
router.delete('/:id', AuthMiddleware.authenticate, (req: Request, res: Response) => NailDesignController.deleteDesign(req as any, res));

export { router as designsRoutes }; 
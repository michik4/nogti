import { Router } from 'express';
import { MasterController } from '../controllers/master.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/masters/can-do/:designId
 * Добавить дизайн в список "Я так могу"
 */
router.post('/can-do/:designId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.addCanDoDesign);

/**
 * DELETE /api/masters/can-do/:designId
 * Удалить дизайн из списка "Я так могу"
 */
router.delete('/can-do/:designId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.removeCanDoDesign);

/**
 * GET /api/masters/my-designs
 * Получить дизайны мастера
 */
router.get('/my-designs', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.getMasterDesigns);

/**
 * PUT /api/masters/can-do/:designId
 * Обновить информацию о дизайне в списке мастера
 */
router.put('/can-do/:designId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.updateMasterDesign);

/**
 * GET /api/masters/profile/:id
 * Получить профиль мастера по ID
 */
router.get('/profile/:id', AuthMiddleware.optionalAuth, MasterController.getMasterProfile);

/**
 * GET /api/masters/profile
 * Получить свой профиль мастера
 */
router.get('/profile', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.getMasterProfile);

/**
 * PUT /api/masters/profile
 * Обновить свой профиль мастера
 */
router.put('/profile', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.updateMasterProfile);

/**
 * GET /api/masters/nearby
 * Найти мастеров по геолокации
 */
router.get('/nearby', AuthMiddleware.optionalAuth, MasterController.findNearbyMasters);

/**
 * GET /api/masters/search
 * Поиск мастеров по имени или адресу
 */
router.get('/search', MasterController.searchMasters);

/**
 * GET /api/masters/designs
 * Получение дизайнов, которые мастер может выполнить
 */
router.get('/designs', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.getMasterDesigns);

/**
 * GET /api/masters/stats
 * Получение статистики мастера
 */
router.get('/stats', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.getMasterStats);

/**
 * GET /api/masters/popular
 * Получить популярных мастеров
 */
router.get('/popular', MasterController.getPopularMasters);

/**
 * GET /api/masters
 * Получить всех мастеров
 */
router.get('/', MasterController.getAllMasters);

// Роуты для услуг
router.get('/:masterId/services', MasterController.getMasterServices);
router.post('/:masterId/services', AuthMiddleware.authenticate, MasterController.addMasterService);
router.put('/services/:serviceId', AuthMiddleware.authenticate, MasterController.updateMasterService);
router.delete('/services/:serviceId', AuthMiddleware.authenticate, MasterController.deleteMasterService);

// Роуты для дизайнов услуг
/**
 * GET /api/masters/services/:serviceId/designs
 * Получить дизайны для конкретной услуги
 */
router.get('/services/:serviceId/designs', MasterController.getServiceDesigns);

/**
 * POST /api/masters/services/:serviceId/designs/:designId
 * Добавить дизайн к услуге
 */
router.post('/services/:serviceId/designs/:designId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.addDesignToService);

/**
 * DELETE /api/masters/services/:serviceId/designs/:designId
 * Удалить дизайн из услуги
 */
router.delete('/services/:serviceId/designs/:designId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.removeDesignFromService);

/**
 * PUT /api/masters/services/:serviceId/designs/:designId
 * Обновить информацию о дизайне в услуге
 */
router.put('/services/:serviceId/designs/:designId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), MasterController.updateServiceDesign);

export { router as mastersRoutes }; 
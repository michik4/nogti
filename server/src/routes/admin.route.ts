import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/admin/stats
 * @desc Получение статистики для админ панели
 * @access Private (Admin)
 */
router.get('/stats', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole('admin'),
  AdminController.getStats
);

/**
 * @route GET /api/admin/users
 * @desc Получение списка пользователей с пагинацией и поиском
 * @access Private (Admin)
 */
router.get('/users',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole('admin'),
  AdminController.getUsers
);

/**
 * @route PUT /api/admin/users/:userId/block
 * @desc Блокировка/разблокировка пользователя
 * @access Private (Admin)
 */
router.put('/users/:userId/block',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole('admin'),
  AdminController.toggleUserBlock
);

/**
 * @route GET /api/admin/designs
 * @desc Получение списка дизайнов с пагинацией
 * @access Private (Admin)
 */
router.get('/designs',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole('admin'),
  AdminController.getDesigns
);

/**
 * @route PUT /api/admin/designs/:designId/moderate
 * @desc Модерация дизайна (одобрение/отклонение)
 * @access Private (Admin)
 */
router.put('/designs/:designId/moderate',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole('admin'),
  AdminController.moderateDesign
);

/**
 * @route GET /api/admin/orders
 * @desc Получение списка заказов с пагинацией
 * @access Private (Admin)
 */
router.get('/orders',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole('admin'),
  AdminController.getOrders
);

export { router as adminRouter }; 
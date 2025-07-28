import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/orders/search
 * Поиск заказов по ID или данным клиента/мастера
 */
router.get('/search', AuthMiddleware.authenticate, OrderController.searchOrders);

/**
 * POST /api/orders
 * Создать новый заказ
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), OrderController.createOrder);

/**
 * GET /api/orders
 * Получить заказы пользователя
 */
router.get('/', AuthMiddleware.authenticate, OrderController.getUserOrders);

/**
 * GET /api/orders/:id
 * Получение информации о конкретном заказе
 */
router.get('/:id', AuthMiddleware.authenticate, OrderController.getOrderById);

/**
 * PUT /api/orders/:id/confirm
 * Подтвердить заказ (для мастера)
 */
router.put('/:id/confirm', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), OrderController.confirmOrder);

/**
 * PUT /api/orders/:id/propose-time
 * Предложить альтернативное время (для мастера)
 */
router.put('/:id/propose-time', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), OrderController.proposeAlternativeTime);

/**
 * PUT /api/orders/:id/decline
 * Отклонить заказ (для мастера)
 */
router.put('/:id/decline', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), OrderController.declineOrder);

/**
 * PUT /api/orders/:id/accept-proposed-time
 * Принять предложенное время (для клиента)
 */
router.put('/:id/accept-proposed-time', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), OrderController.acceptProposedTime);

/**
 * PUT /api/orders/:id/cancel
 * Отменить заказ (для клиента)
 */
router.put('/:id/cancel', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), OrderController.cancelOrder);

/**
 * PUT /api/orders/:id/complete
 * Завершить заказ (для мастера)
 */
router.put('/:id/complete', AuthMiddleware.authenticate, AuthMiddleware.requireRole('nailmaster'), OrderController.completeOrder);

export { router as ordersRoutes }; 
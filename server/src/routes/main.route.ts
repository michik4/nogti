import { Router } from 'express';
import { AuthRouter } from './auth.route';
import { designsRoutes } from './designs.route';
import { ordersRoutes } from './orders.route';
import { mastersRoutes } from './masters.route';
import { adminRouter } from './admin.route';
import { MasterRatingRouter } from './master-rating.route';

const router = Router();

// Подключаем роуты для разных модулей
router.use('/auth', AuthRouter);
router.use('/designs', designsRoutes);
router.use('/orders', ordersRoutes);
router.use('/masters', mastersRoutes);
router.use('/admin', adminRouter);
router.use('/master-rating', MasterRatingRouter);

// Базовый endpoint для проверки здоровья API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API работает корректно',
        timestamp: new Date().toISOString()
    });
});

export default router;
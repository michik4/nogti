import { Router } from "express";
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ClientController } from "../controllers/client.controller";
import { MasterController } from "../controllers/master.controller";

const router = Router();

router.get('/review/check/:reviewId', AuthMiddleware.authenticate, ClientController.checkExistReview);

router.get('/review/check-client/:masterId', AuthMiddleware.authenticate, ClientController.checkExistReviewAtMaster)

router.get('/:masterId', AuthMiddleware.optionalAuth, MasterController.getReviews);

router.post('/',  AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), ClientController.sendReview);

// Новые роуты для редактирования и удаления отзывов
router.put('/:reviewId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), ClientController.updateReview);

router.delete('/:reviewId', AuthMiddleware.authenticate, AuthMiddleware.requireRole('client'), ClientController.deleteReview);

export {router as MasterRatingRouter};
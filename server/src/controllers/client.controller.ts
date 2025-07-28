import { Response, Request } from 'express';
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppDataSource } from '../conf/orm.conf';
import { ClientEntity, MasterRatingEntity, NailMasterEntity } from '../entities';
import { ApiResponse, PaginatedResponse } from '../types/api.type';
import { validate as uuidValidate } from 'uuid';
import { instanceToInstance } from 'class-transformer';
import { recalculateMasterRating } from '../utils/rating.util';

export class ClientController {
    static async sendReview(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!
            const { masterId, ratingNumber, description } = req.body;

            console.log(
                '[ClientController] sendReview data:',
                '\nuserId: ', userId,
                '\nmasterId: ', masterId
            )

            // проверяем, что пользователь - клиент
            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({ where: { id: userId } });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'пользователь должен быть клиентом, чтобы оставлять отзывы'
                }
                res.status(400).json(response);
                return;
            }

            // находим мастера
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: masterId } })

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
            const existingMasterRating = await masterRatingRepository.findOne({
                where: {
                    client: { id: userId },
                    nailMaster: { id: masterId }
                }
            });

            if (existingMasterRating) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Отзыв уже был оставлен'
                };
                res.status(409).json(response);
                return;
            }

            const masterRating = new MasterRatingEntity();
            masterRating.client = client;
            masterRating.nailMaster = master;
            masterRating.ratingNumber = ratingNumber;
            masterRating.description = description;
            masterRating.createdAt = new Date(Date.now());

            const savedMasterRating = await masterRatingRepository.save(masterRating);

            // Пересчитываем рейтинг мастера после добавления нового отзыва
            try {
                await recalculateMasterRating(masterId);
                console.log(`[ClientController] Рейтинг мастера ${masterId} успешно пересчитан`);
            } catch (ratingError) {
                console.error('[ClientController] Ошибка при пересчете рейтинга мастера:', ratingError);
                // Продолжаем выполнение, так как отзыв уже сохранен
            }

            const sanitizedData = instanceToInstance(savedMasterRating);

            const response: ApiResponse<MasterRatingEntity> = {
                success: true,
                data: sanitizedData,
                message: 'Отзыв оставлен'
            };

            res.status(201).json(response);

        } catch (error) {
            console.error('Ошибка добавления дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    static checkExistReviewAtMaster = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId!;
            const { masterId } = req.params;

            // проверяем, что пользователь - клиент
            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({ where: { id: userId } });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'пользователь должен быть клиентом, чтобы оставлять отзывы'
                }
                res.status(400).json(response);
                return;
            }

            // находим мастера
            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const master = await masterRepository.findOne({ where: { id: masterId } })

            if (!master) {
                const response: ApiResponse = {
                    success: false,
                    error: 'мастер не найден'
                };
                res.status(404).json(response);
                return;
            }

            const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
            const existingMasterRating = await masterRatingRepository.findOne({
                where: {
                    client: { id: userId },
                    nailMaster: { id: masterId }
                }
            });

            if (existingMasterRating) {
                const response: ApiResponse = {
                    success: true,
                    message: 'Отзыв уже был оставлен',
                    status: 200
                };
                res.status(200).json(response);
                return;
            } else {
                const response: ApiResponse = {
                    success: true,
                    message: 'Отзыв не найден',
                    status: 404
                }
                res.status(200).json(response);
                return;
            }

        } catch (error) {
            console.error('Ошибка добавления дизайна:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    static async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { reviewId } = req.params;
            const { ratingNumber, description } = req.body;

            console.log(
                '[ClientController] updateReview data:',
                '\nuserId: ', userId,
                '\nreviewId: ', reviewId,
                '\nratingNumber: ', ratingNumber
            );

            // Проверяем, что пользователь - клиент
            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({ where: { id: userId } });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'пользователь должен быть клиентом, чтобы редактировать отзывы'
                };
                res.status(400).json(response);
                return;
            }

            // Находим отзыв
            const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
            const existingReview = await masterRatingRepository.findOne({
                where: { id: reviewId },
                relations: ['client', 'nailMaster']
            });

            if (!existingReview) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Отзыв не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Добавляем отладочную информацию для проверки авторства
            console.log('[ClientController] updateReview авторство:');
            console.log('- Текущий пользователь ID:', userId);
            console.log('- Автор отзыва ID:', existingReview.client.id);
            console.log('- Типы:', typeof userId, 'vs', typeof existingReview.client.id);
            console.log('- Строгое равенство:', userId === existingReview.client.id);
            console.log('- Нестрогое равенство:', userId == existingReview.client.id);

            // Проверяем, что пользователь является автором отзыва
            if (existingReview.client.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Вы можете редактировать только свои отзывы'
                };
                res.status(403).json(response);
                return;
            }

            // Обновляем отзыв
            existingReview.ratingNumber = ratingNumber;
            existingReview.description = description;

            const updatedReview = await masterRatingRepository.save(existingReview);

            // Пересчитываем рейтинг мастера после обновления отзыва
            try {
                await recalculateMasterRating(existingReview.nailMaster.id);
                console.log(`[ClientController] Рейтинг мастера ${existingReview.nailMaster.id} пересчитан после обновления отзыва`);
            } catch (ratingError) {
                console.error('[ClientController] Ошибка при пересчете рейтинга мастера:', ratingError);
                // Продолжаем выполнение, так как отзыв уже обновлен
            }

            const sanitizedData = instanceToInstance(updatedReview);

            const response: ApiResponse<MasterRatingEntity> = {
                success: true,
                data: sanitizedData,
                message: 'Отзыв обновлен'
            };

            res.status(200).json(response);

        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    static async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { reviewId } = req.params;

            console.log(
                '[ClientController] deleteReview data:',
                '\nuserId: ', userId,
                '\nreviewId: ', reviewId
            );

            // Проверяем, что пользователь - клиент
            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({ where: { id: userId } });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'пользователь должен быть клиентом, чтобы удалять отзывы'
                };
                res.status(400).json(response);
                return;
            }

            // Находим отзыв
            const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
            const existingReview = await masterRatingRepository.findOne({
                where: { id: reviewId },
                relations: ['client', 'nailMaster']
            });

            if (!existingReview) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Отзыв не найден'
                };
                res.status(404).json(response);
                return;
            }

            // Добавляем отладочную информацию для проверки авторства
            console.log('[ClientController] deleteReview авторство:');
            console.log('- Текущий пользователь ID:', userId);
            console.log('- Автор отзыва ID:', existingReview.client.id);
            console.log('- Типы:', typeof userId, 'vs', typeof existingReview.client.id);
            console.log('- Строгое равенство:', userId === existingReview.client.id);

            // Проверяем, что пользователь является автором отзыва
            if (existingReview.client.id !== userId) {
                const response: ApiResponse = {
                    success: false,
                    error: 'Вы можете удалять только свои отзывы'
                };
                res.status(403).json(response);
                return;
            }

            const masterId = existingReview.nailMaster.id;

            // Удаляем отзыв
            await masterRatingRepository.remove(existingReview);

            // Пересчитываем рейтинг мастера после удаления отзыва
            try {
                await recalculateMasterRating(masterId);
                console.log(`[ClientController] Рейтинг мастера ${masterId} пересчитан после удаления отзыва`);
            } catch (ratingError) {
                console.error('[ClientController] Ошибка при пересчете рейтинга мастера:', ratingError);
                // Продолжаем выполнение, так как отзыв уже удален
            }

            const response: ApiResponse = {
                success: true,
                message: 'Отзыв удален'
            };

            res.status(200).json(response);

        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

    static checkExistReview = async (req: Request, res: Response): Promise<void> => {
        const { reviewId } = req.params;

        const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
        const existReview = masterRatingRepository.findOne({
            where: {
                id: reviewId
            }
        });

        if (!existReview) {
            const response: ApiResponse = {
                success: false,
                error: 'отзыв не найден'
            }
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: existReview,
            message: 'отзыв найден'
        }
        res.status(200).json(response);
        return;
    }

    static async getClientStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;

            console.log('[ClientController] getClientStats для пользователя:', userId);

            // Проверяем, что пользователь - клиент
            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const client = await clientRepository.findOne({ where: { id: userId } });

            if (!client) {
                const response: ApiResponse = {
                    success: false,
                    error: 'пользователь должен быть клиентом'
                };
                res.status(400).json(response);
                return;
            }

            const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);
            
            // Получаем все отзывы клиента
            const clientReviews = await masterRatingRepository.find({
                where: { client: { id: userId } },
                relations: ['nailMaster']
            });

            // Вычисляем статистику
            const totalReviews = clientReviews.length;
            
            let averageRatingGiven = 0;
            if (totalReviews > 0) {
                const totalRating = clientReviews.reduce((sum, review) => sum + review.ratingNumber, 0);
                averageRatingGiven = Math.round((totalRating / totalReviews) * 10) / 10;
            }

            // Распределение оценок, которые ставит клиент
            const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 звезд
            clientReviews.forEach(review => {
                if (review.ratingNumber >= 1 && review.ratingNumber <= 5) {
                    ratingDistribution[review.ratingNumber - 1]++;
                }
            });

            // Последние отзывы
            const recentReviews = clientReviews
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(review => ({
                    id: review.id,
                    ratingNumber: review.ratingNumber,
                    description: review.description,
                    createdAt: review.createdAt,
                    masterName: review.nailMaster.fullName
                }));

            const stats = {
                totalReviews,
                averageRatingGiven,
                ratingDistribution,
                recentReviews
            };

            const response: ApiResponse<typeof stats> = {
                success: true,
                data: stats,
                message: 'Статистика клиента получена'
            };

            res.status(200).json(response);

        } catch (error) {
            console.error('Ошибка при получении статистики клиента:', error);
            const response: ApiResponse = {
                success: false,
                error: 'Внутренняя ошибка сервера'
            };
            res.status(500).json(response);
        }
    }

}
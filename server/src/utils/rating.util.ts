import { AppDataSource } from '../conf/orm.conf';
import { MasterRatingEntity, NailMasterEntity } from '../entities';

/**
 * Пересчитывает и обновляет рейтинг мастера на основе всех его отзывов
 * @param masterId - ID мастера
 * @returns Promise<void>
 */
export const recalculateMasterRating = async (masterId: string): Promise<void> => {
    try {
        const masterRepository = AppDataSource.getRepository(NailMasterEntity);
        const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);

        // Получаем все отзывы мастера
        const ratings = await masterRatingRepository.find({
            where: { nailMaster: { id: masterId } }
        });

        // Вычисляем средний рейтинг
        let averageRating = 0;
        const reviewsCount = ratings.length;

        if (reviewsCount > 0) {
            const totalRating = ratings.reduce((sum, rating) => sum + rating.ratingNumber, 0);
            averageRating = Math.round((totalRating / reviewsCount) * 10) / 10; // Округляем до 1 знака после запятой
        }

        // Обновляем мастера
        await masterRepository.update(masterId, {
            rating: averageRating,
            reviewsCount: reviewsCount
        });

        console.log(`[Rating Util] Обновлен рейтинг мастера ${masterId}: ${averageRating} (${reviewsCount} отзывов)`);

    } catch (error) {
        console.error('[Rating Util] Ошибка при пересчете рейтинга мастера:', error);
        throw error;
    }
};

/**
 * Получает статистику рейтингов мастера
 * @param masterId - ID мастера
 * @returns Promise<{ averageRating: number, reviewsCount: number, ratingDistribution: number[] }>
 */
export const getMasterRatingStats = async (masterId: string): Promise<{
    averageRating: number;
    reviewsCount: number;
    ratingDistribution: number[];
}> => {
    try {
        const masterRatingRepository = AppDataSource.getRepository(MasterRatingEntity);

        // Получаем все отзывы мастера
        const ratings = await masterRatingRepository.find({
            where: { nailMaster: { id: masterId } }
        });

        const reviewsCount = ratings.length;
        let averageRating = 0;
        const ratingDistribution = [0, 0, 0, 0, 0]; // Для рейтингов 1-5

        if (reviewsCount > 0) {
            const totalRating = ratings.reduce((sum, rating) => sum + rating.ratingNumber, 0);
            averageRating = Math.round((totalRating / reviewsCount) * 10) / 10;

            // Подсчитываем распределение оценок
            ratings.forEach(rating => {
                if (rating.ratingNumber >= 1 && rating.ratingNumber <= 5) {
                    ratingDistribution[rating.ratingNumber - 1]++;
                }
            });
        }

        return {
            averageRating,
            reviewsCount,
            ratingDistribution
        };

    } catch (error) {
        console.error('[Rating Util] Ошибка при получении статистики рейтинга мастера:', error);
        throw error;
    }
}; 
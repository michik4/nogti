import { AppDataSource } from '../conf/orm.conf';
import { NailMasterEntity, MasterRatingEntity } from '../entities';
import { recalculateMasterRating, getMasterRatingStats } from '../utils/rating.util';
import { TableUtil } from '../utils/table.util';
import { UserEntity, ClientEntity } from '../entities';

export class RatingCli {
    /**
     * Пересчитывает рейтинг для всех мастеров
     */
    static async recalculateAllRatings(): Promise<void> {
        try {
            console.log('🔄 Начинаем пересчет рейтингов для всех мастеров...\n');

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const masters = await masterRepository.find();

            console.log(`📊 Найдено мастеров: ${masters.length}\n`);

            const results = [];
            for (const master of masters) {
                try {
                    const statsBefore = await getMasterRatingStats(master.id);
                    await recalculateMasterRating(master.id);
                    
                    // Получаем обновленного мастера
                    const updatedMaster = await masterRepository.findOne({ where: { id: master.id } });
                    
                    results.push({
                        'ID мастера': master.id.substring(0, 8) + '...',
                        'Имя': master.fullName,
                        'Рейтинг': updatedMaster?.rating || 0,
                        'Отзывов': updatedMaster?.reviewsCount || 0,
                        'Статус': '✅ Обновлен'
                    });
                } catch (error) {
                    results.push({
                        'ID мастера': master.id.substring(0, 8) + '...',
                        'Имя': master.fullName,
                        'Рейтинг': 'Ошибка',
                        'Отзывов': 'Ошибка',
                        'Статус': '❌ Ошибка: ' + (error as Error).message
                    });
                }
            }

            console.log('📋 Результаты пересчета рейтингов:');
            TableUtil.printTable(results);

            console.log('\n✅ Пересчет рейтингов завершен!');

        } catch (error) {
            console.error('❌ Ошибка при пересчете рейтингов:', error);
            throw error;
        }
    }

    /**
     * Показывает подробную статистику рейтингов для конкретного мастера
     */
    static async showMasterRatingStats(masterId: string): Promise<void> {
        try {
            console.log(`📊 Статистика рейтингов для мастера ${masterId}\n`);

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const ratingRepository = AppDataSource.getRepository(MasterRatingEntity);

            // Получаем информацию о мастере
            const master = await masterRepository.findOne({ where: { id: masterId } });
            if (!master) {
                console.log('❌ Мастер не найден');
                return;
            }

            // Получаем статистику
            const stats = await getMasterRatingStats(masterId);

            // Получаем детальные отзывы
            const reviews = await ratingRepository.find({
                where: { nailMaster: { id: masterId } },
                relations: ['client'],
                order: { createdAt: 'DESC' }
            });

            console.log('👤 Информация о мастере:');
            TableUtil.printTable([{
                'Имя': master.fullName,
                'Текущий рейтинг': master.rating,
                'Количество отзывов': master.reviewsCount,
                'Активен': master.isActive ? '✅' : '❌'
            }]);

            console.log('\n📈 Статистика рейтингов:');
            TableUtil.printTable([{
                'Средний рейтинг': stats.averageRating,
                'Всего отзывов': stats.reviewsCount,
                '⭐ 1 звезда': stats.ratingDistribution[0],
                '⭐ 2 звезды': stats.ratingDistribution[1],
                '⭐ 3 звезды': stats.ratingDistribution[2],
                '⭐ 4 звезды': stats.ratingDistribution[3],
                '⭐ 5 звезд': stats.ratingDistribution[4]
            }]);

            if (reviews.length > 0) {
                console.log('\n💬 Последние отзывы:');
                const reviewsData = reviews.slice(0, 5).map(review => ({
                    'Дата': review.createdAt.toLocaleDateString('ru-RU'),
                    'Клиент': review.client.fullName,
                    'Оценка': '⭐'.repeat(review.ratingNumber),
                    'Комментарий': review.description?.substring(0, 50) + (review.description?.length > 50 ? '...' : '')
                }));
                TableUtil.printTable(reviewsData);
            } else {
                console.log('\n💬 Отзывов пока нет');
            }

        } catch (error) {
            console.error('❌ Ошибка при получении статистики:', error);
            throw error;
        }
    }

    /**
     * Показывает общую статистику по всем рейтингам
     */
    static async showOverallStats(): Promise<void> {
        try {
            console.log('📊 Общая статистика рейтингов системы\n');

            const masterRepository = AppDataSource.getRepository(NailMasterEntity);
            const ratingRepository = AppDataSource.getRepository(MasterRatingEntity);

            // Общее количество мастеров и отзывов
            const totalMasters = await masterRepository.count();
            const totalReviews = await ratingRepository.count();

            // Мастера с рейтингами
            const mastersWithRatings = await masterRepository
                .createQueryBuilder('master')
                .where('master.reviewsCount > 0')
                .getCount();

            // Средний рейтинг по системе
            const avgRatingResult = await masterRepository
                .createQueryBuilder('master')
                .select('AVG(master.rating)', 'avgRating')
                .where('master.reviewsCount > 0')
                .getRawOne();

            // Топ-5 мастеров по рейтингу
            const topMasters = await masterRepository
                .createQueryBuilder('master')
                .where('master.reviewsCount >= 3') // Минимум 3 отзыва для рейтинга
                .orderBy('master.rating', 'DESC')
                .addOrderBy('master.reviewsCount', 'DESC')
                .limit(5)
                .getMany();

            console.log('📈 Общая статистика:');
            TableUtil.printTable([{
                'Всего мастеров': totalMasters,
                'Мастеров с отзывами': mastersWithRatings,
                'Всего отзывов': totalReviews,
                'Средний рейтинг': parseFloat(avgRatingResult?.avgRating || '0').toFixed(1)
            }]);

            if (topMasters.length > 0) {
                console.log('\n🏆 Топ-5 мастеров по рейтингу:');
                const topData = topMasters.map((master, index) => ({
                    'Место': index + 1,
                    'Имя': master.fullName,
                    'Рейтинг': master.rating,
                    'Отзывов': master.reviewsCount,
                    'Статус': master.isActive ? '✅ Активен' : '❌ Неактивен'
                }));
                TableUtil.printTable(topData);
            }

        } catch (error) {
            console.error('❌ Ошибка при получении общей статистики:', error);
            throw error;
        }
    }

    /**
     * Показывает детали конкретного отзыва
     */
    static async showReviewDetails(reviewId: string): Promise<void> {
        try {
            console.log(`📝 Детали отзыва ${reviewId}\n`);

            const ratingRepository = AppDataSource.getRepository(MasterRatingEntity);

            // Получаем отзыв с полной информацией
            const review = await ratingRepository.findOne({
                where: { id: reviewId },
                relations: ['client', 'nailMaster']
            });

            if (!review) {
                console.log('❌ Отзыв не найден');
                return;
            }

            console.log('📋 Информация об отзыве:');
            TableUtil.printTable([{
                'ID отзыва': review.id,
                'Оценка': '⭐'.repeat(review.ratingNumber) + ` (${review.ratingNumber}/5)`,
                'Дата создания': review.createdAt.toLocaleDateString('ru-RU'),
                'Комментарий': review.description?.substring(0, 100) + (review.description?.length > 100 ? '...' : '')
            }]);

            console.log('\n👤 Информация о клиенте:');
            TableUtil.printTable([{
                'ID клиента': review.client.id,
                'Тип ID клиента': typeof review.client.id,
                'Имя клиента': review.client.fullName,
                'Email': review.client.email || 'Не указан'
            }]);

            console.log('\n💅 Информация о мастере:');
            TableUtil.printTable([{
                'ID мастера': review.nailMaster.id,
                'Имя мастера': review.nailMaster.fullName,
                'Текущий рейтинг': review.nailMaster.rating,
                'Всего отзывов': review.nailMaster.reviewsCount
            }]);

            if (review.description && review.description.length > 100) {
                console.log('\n💬 Полный текст отзыва:');
                console.log(`"${review.description}"`);
            }

        } catch (error) {
            console.error('❌ Ошибка при получении деталей отзыва:', error);
            throw error;
        }
    }

    /**
     * Диагностирует проблемы с авторством отзыва для конкретного пользователя
     */
    static async diagnosеOwnership(userId: string, reviewId?: string): Promise<void> {
        try {
            console.log(`🔍 Диагностика авторства для пользователя ${userId}\n`);

            const userRepository = AppDataSource.getRepository(UserEntity);
            const clientRepository = AppDataSource.getRepository(ClientEntity);
            const ratingRepository = AppDataSource.getRepository(MasterRatingEntity);

            // Проверяем пользователя
            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                console.log('❌ Пользователь не найден');
                return;
            }

            console.log('👤 Информация о пользователе:');
            TableUtil.printTable([{
                'ID пользователя': user.id,
                'Тип ID': typeof user.id,
                'Email': user.email,
                'Роль': user.role
            }]);

            // Проверяем клиента
            const client = await clientRepository.findOne({ where: { id: userId } });
            
            console.log('\n👥 Информация о клиенте:');
            if (client) {
                TableUtil.printTable([{
                    'ID клиента': client.id,
                    'Тип ID': typeof client.id,
                    'Имя': client.fullName,
                    'Статус': '✅ Найден'
                }]);
            } else {
                console.log('❌ Клиент не найден - пользователь не является клиентом');
            }

            // Находим все отзывы пользователя
            const userReviews = await ratingRepository.find({
                where: { client: { id: userId } },
                relations: ['client', 'nailMaster']
            });

            console.log(`\n📝 Отзывы пользователя (найдено: ${userReviews.length}):`);
            if (userReviews.length > 0) {
                const reviewsData = userReviews.map(review => ({
                    'ID отзыва': review.id.substring(0, 8) + '...',
                    'Мастер': review.nailMaster.fullName,
                    'Оценка': review.ratingNumber,
                    'Дата': review.createdAt.toLocaleDateString('ru-RU')
                }));
                TableUtil.printTable(reviewsData);
            } else {
                console.log('Отзывов не найдено');
            }

            // Если указан конкретный отзыв, проверяем авторство
            if (reviewId) {
                console.log(`\n🔍 Проверка авторства отзыва ${reviewId}:`);
                
                const targetReview = await ratingRepository.findOne({
                    where: { id: reviewId },
                    relations: ['client', 'nailMaster']
                });

                if (!targetReview) {
                    console.log('❌ Отзыв не найден');
                    return;
                }

                console.log('🆔 Сравнение ID:');
                TableUtil.printTable([{
                    'Пользователь ID': userId,
                    'Автор отзыва ID': targetReview.client.id,
                    'Типы': `${typeof userId} vs ${typeof targetReview.client.id}`,
                    'Строгое равенство': userId === targetReview.client.id ? '✅' : '❌',
                    'Нестрогое равенство': userId == targetReview.client.id ? '✅' : '❌'
                }]);

                const isOwner = userId === targetReview.client.id;
                console.log(`\n${isOwner ? '✅' : '❌'} Результат: пользователь ${isOwner ? 'ЯВЛЯЕТСЯ' : 'НЕ ЯВЛЯЕТСЯ'} автором отзыва`);
            }

        } catch (error) {
            console.error('❌ Ошибка при диагностике авторства:', error);
            throw error;
        }
    }
} 
import { NailDesignEntity } from '../entities/nail-design.entity';
import { OrderDesignSnapshotEntity } from '../entities/order-design-snapshot.entity';

export class DesignSnapshotUtil {
    /**
     * Создает снимок дизайна для сохранения в заказе
     */
    static createDesignSnapshot(design: NailDesignEntity): OrderDesignSnapshotEntity {
        const snapshot = new OrderDesignSnapshotEntity();
        
        // Копируем основные поля
        snapshot.title = design.title;
        snapshot.description = design.description;
        snapshot.imageUrl = design.imageUrl;
        snapshot.videoUrl = design.videoUrl;
        snapshot.type = design.type;
        snapshot.source = design.source;
        snapshot.tags = design.tags;
        snapshot.color = design.color;
        
        // Сохраняем информацию об оригинальном дизайне
        snapshot.originalDesignId = design.id;
        
        // Определяем автора
        if (design.uploadedByClient) {
            snapshot.authorName = design.uploadedByClient.username;
            snapshot.authorId = design.uploadedByClient.id;
        } else if (design.uploadedByAdmin) {
            snapshot.authorName = design.uploadedByAdmin.username;
            snapshot.authorId = design.uploadedByAdmin.id;
        } else if (design.uploadedByMaster) {
            snapshot.authorName = design.uploadedByMaster.username;
            snapshot.authorId = design.uploadedByMaster.id;
        }
        
        return snapshot;
    }
} 
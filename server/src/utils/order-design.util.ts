import { OrderEntity } from '../entities/order.entity';
import { OrderDesignSnapshotEntity } from '../entities/order-design-snapshot.entity';

export interface OrderDesignInfo {
    id?: string;
    title: string;
    description?: string;
    imageUrl: string;
    videoUrl?: string;
    type: string;
    source: string;
    tags?: string[];
    color?: string;
    authorName?: string;
    authorId?: string;
    isSnapshot: boolean;
}

export class OrderDesignUtil {
    /**
     * Получает информацию о дизайне из заказа (из снимка или из связи)
     */
    static getDesignInfo(order: OrderEntity): OrderDesignInfo | null {
        // Приоритет отдается снимку дизайна
        if (order.designSnapshot) {
            return {
                id: order.designSnapshot.originalDesignId,
                title: order.designSnapshot.title,
                description: order.designSnapshot.description,
                imageUrl: order.designSnapshot.imageUrl,
                videoUrl: order.designSnapshot.videoUrl,
                type: order.designSnapshot.type,
                source: order.designSnapshot.source,
                tags: order.designSnapshot.tags,
                color: order.designSnapshot.color,
                authorName: order.designSnapshot.authorName,
                authorId: order.designSnapshot.authorId,
                isSnapshot: true
            };
        }
        
        // Если снимка нет, используем связь с дизайном
        if (order.nailDesign) {
            return {
                id: order.nailDesign.id,
                title: order.nailDesign.title,
                description: order.nailDesign.description,
                imageUrl: order.nailDesign.imageUrl,
                videoUrl: order.nailDesign.videoUrl,
                type: order.nailDesign.type,
                source: order.nailDesign.source,
                tags: order.nailDesign.tags,
                color: order.nailDesign.color,
                authorName: order.nailDesign.uploadedByClient?.username || 
                           order.nailDesign.uploadedByAdmin?.username || 
                           order.nailDesign.uploadedByMaster?.username,
                authorId: order.nailDesign.uploadedByClient?.id || 
                         order.nailDesign.uploadedByAdmin?.id || 
                         order.nailDesign.uploadedByMaster?.id,
                isSnapshot: false
            };
        }
        
        return null;
    }
} 
import { ApiResponse } from "@/types/api.types";
import { apiService as api } from "./api";
import { masterRating } from "@/types/master-rating.type";

export interface CreateMasterRatingPayload {
    ratingNumber: number;
    description?: string;
    masterId: string; // Отправляем только ID мастера
    client: string;     // Отправляем только ID клиента
}

export interface UpdateMasterRatingPayload {
    ratingNumber: number;
    description?: string;
}

export interface StatusApiResponse extends ApiResponse {
    status?: number
}

export const masterRatingService = {
    getMasterRatingById: async (masterId: string): Promise<masterRating[]> => {
        const endpoint = `/master-rating/${masterId}`;
        const res = await api.get<masterRating[]>(endpoint);
        return res.data as masterRating[];
    },

    sendReview: async (payload: CreateMasterRatingPayload): Promise<masterRating> => {
        try {
            // Теперь мы передаем один объект payload, который идеально соответствует
            // тому, что ожидает API для создания отзыва.
            const res = await api.post<masterRating>('/master-rating/', payload, true);
            return res.data;
        } catch (error) {
            console.error('send review error: ', error);
            // Пробрасываем ошибку, чтобы компонент мог её поймать
            throw error;
        }
    },

    updateReview: async (reviewId: string, payload: UpdateMasterRatingPayload): Promise<masterRating> => {
        try {
            const res = await api.put<masterRating>(`/master-rating/${reviewId}`, payload, true);
            return res.data;
        } catch (error) {
            console.error('update review error: ', error);
            throw error;
        }
    },

    deleteReview: async (reviewId: string): Promise<void> => {
        try {
            await api.delete(`/master-rating/${reviewId}`, true);
        } catch (error) {
            console.error('delete review error: ', error);
            throw error;
        }
    },

    checkExistReviewAtMaster: async (masterId: string): Promise<boolean> => {
        try {
            const endpoint = `/master-rating/review/check-client/${masterId}`;
            const res = await api.get<StatusApiResponse>(endpoint, true);

            console.log(`[checkExistReviewAtMaster] res.status = ${res.status}`);

            if (res.status == 200) {    
                return true;
            } else if (res.status == 404) {
                return false;
            } else {
                throw Error;
            }

        } catch (error) {

            console.error('checkExistReviewAtMaster error: ', error);
            throw error;
        }
    }
}
import { apiService } from './api';
import { ApiResponse } from '@/types/api.types';
import { Upload } from '@/types/upload.types';

export interface CreateUploadData {
  title: string;
  type: 'photo' | 'video';
  file: File;
  userId: string;
}

export const uploadService = {
  async getUploads(userId: string): Promise<ApiResponse<Upload[]>> {
    return apiService.get<Upload[]>(`/uploads?userId=${userId}`);
  },

  async createUpload(data: CreateUploadData): Promise<ApiResponse<Upload>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('file', data.file);
    formData.append('userId', data.userId);

    // Дополнительная проверка размера файла
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (data.file.size > maxSize) {
      throw new Error('Файл слишком большой. Максимальный размер: 50MB');
    }

    // Проверка типа файла
    const allowedTypes = {
      photo: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    };

    const fileType = data.type === 'video' ? 'video' : 'photo';
    if (!allowedTypes[fileType].includes(data.file.type)) {
      throw new Error(`Неподдерживаемый тип файла для ${fileType}`);
    }

    return apiService.uploadFile<Upload>('/uploads', formData);
  },

  async deleteUpload(uploadId: string): Promise<ApiResponse<null>> {
    return apiService.delete<null>(`/uploads/${uploadId}`);
  },

  async likeUpload(uploadId: string): Promise<ApiResponse<Upload>> {
    return apiService.post<Upload>(`/uploads/${uploadId}/like`, {});
  }
};

import { Response } from 'express';
import { ApiResponse } from '../types/api.type';
import ResponseType from '../types/response.type';

/**
 * Создает успешный ответ API
 */
export const createSuccessResponse = (
    message: string,
    code: number = 200,
    data: any = null
): ResponseType => {
    return {
        success: true,
        error: null,
        message,
        status: 'ok',
        code,
        data
    };
};

/**
 * Создает ответ с ошибкой API
 */
export const createErrorResponse = (
    error: string,
    message: string = 'Произошла ошибка',
    code: number = 500,
    data: any = null
): ResponseType => {
    return {
        success: false,
        error,
        message,
        status: 'error',
        code,
        data
    };
};

/**
 * Создает ответ с предупреждением
 */
export const createWarningResponse = (
    message: string,
    code: number = 200,
    data: any = null
): ResponseType => {
    return {
        success: true,
        error: null,
        message,
        status: 'warning',
        code,
        data
    };
};

/**
 * Создает информационный ответ
 */
export const createInfoResponse = (
    message: string,
    code: number = 200,
    data: any = null
): ResponseType => {
    return {
        success: true,
        error: null,
        message,
        status: 'info',
        code,
        data
    };
};

export class ResponseUtil {
  static success<T>(res: Response, message: string, data?: T): Response {
    return res.json({
      success: true,
      message,
      data,
      error: null
    });
  }

  static error(res: Response, message: string, error?: any): Response {
    console.error('Error:', error);
    return res.status(error?.status || 400).json({
      success: false,
      message,
      data: null,
      error: error?.message || error
    });
  }
} 
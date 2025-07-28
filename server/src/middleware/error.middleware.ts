import { Request, Response, NextFunction } from 'express';
import ResponseType from '../types/response.type';
import { ConsoleUtil } from '../utils/console.util';
import  ApiResponse  from '../types/response.type';

// Middleware для обработки 404 - Not Found
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const response: ResponseType = {
        success: false,
        error: `Маршрут ${req.method} ${req.originalUrl} не найден`,
        message: "Запрашиваемый ресурс не существует",
        status: "error",
        code: 404,
        data: {
            method: req.method,
            url: req.originalUrl,
            timestamp: new Date().toISOString(),
            ip: req.ip || req.socket.remoteAddress
        }
    };

    ConsoleUtil.showError(`404 Error: ${req.method} ${req.originalUrl} - IP: ${req.ip || req.socket.remoteAddress}`);
    
    res.status(404).json(response);
};

// Middleware для обработки общих ошибок сервера
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`💥 Server Error:`, err);

    // Определяем код статуса
    const statusCode = err.statusCode || err.status || 500;
    
    // Определяем сообщение об ошибке
    const message = err.message || 'Внутренняя ошибка сервера';
    
    const response: ResponseType = {
        success: false,
        error: message,
        message: statusCode === 500 ? "Произошла внутренняя ошибка сервера" : message,
        status: "error",
        code: statusCode,
        data: {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.socket.remoteAddress,
            // В режиме разработки добавляем stack trace
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    };

    res.status(statusCode).json(response);
};

// Middleware для обработки асинхронных ошибок
export const asyncErrorHandler = (fn: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Middleware для логирования ошибок
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.error(`
🚨 [${timestamp}] ERROR OCCURRED
📍 ${method} ${url}
🌐 IP: ${ip}
🖥️  User-Agent: ${userAgent}
💥 Error: ${err.message}
📚 Stack: ${err.stack}
    `.trim());

    next(err);
};

/**
 * Middleware для проверки тела POST запросов
 */
export const validateRequestBody = (req: Request, res: Response, next: NextFunction): void => {
    // Проверяем только если тело запроса undefined (не обработано express.json())
    // Пустой объект {} является валидным телом запроса
    // Исключаем multipart/form-data запросы (для загрузки файлов)
    const contentType = req.get('Content-Type') || '';
    const isMultipartFormData = contentType.startsWith('multipart/form-data');
    
    if (req.method === 'POST' && req.body === undefined && !isMultipartFormData) {
        const response: ResponseType = {
            success: false,
            error: 'Тело запроса отсутствует или неверный Content-Type',
            message: 'Ошибка валидации запроса',
            status: 'error',
            code: 400,
            data: undefined
        };
        res.status(400).json(response);
        return;
    }
    next();
}; 
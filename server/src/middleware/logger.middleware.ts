import morgan from "morgan";
import { Request, Response } from "express";
import { ConsoleUtil } from "../utils/console.util";

// Кастомный формат логирования
morgan.format('custom', ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms');

// Middleware для логирования успешных запросов
export const successLogger = morgan('custom', {
    skip: (req: Request, res: Response) => res.statusCode >= 400
});

// Middleware для логирования ошибок
export const errorLogger = morgan('custom', {
    skip: (req: Request, res: Response) => res.statusCode < 400
});

// Middleware для детального логирования в режиме разработки
export const devLogger = morgan('dev');

// Middleware для продакшена с минимальной информацией
export const prodLogger = morgan('combined');

// Функция для выбора логгера в зависимости от окружения
export const getLogger = () => {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
        case 'production':
            return prodLogger;
        case 'development':
            return devLogger;
        default:
            return devLogger;
    }
};

// Кастомный middleware для логирования тела запроса (осторожно с паролями!)
export const requestBodyLogger = (req: Request, res: Response, next: any) => {
    const enableRequestLogging = process.env.ENABLE_REQUEST_LOGGING === 'true';
    const enableResponseLogging = process.env.ENABLE_RESPONSE_LOGGING === 'true';
    
    if (!enableRequestLogging) {
        return next();
    }
    
    const start = Date.now();
    
    // Логируем входящий запрос
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`🌐 IP: ${req.ip || req.connection.remoteAddress}`);
    
    // Логируем заголовки (без чувствительных данных)
    const headers = { ...req.headers };
    delete headers.authorization;
    delete headers.cookie;
    console.log(`📋 Headers:`, headers);
    
    // Логируем query параметры
    if (Object.keys(req.query).length > 0) {
        console.log(`🔍 Query:`, req.query);
    }
    
    // Логируем тело запроса (только для не-GET запросов)
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
        const body = { ...req.body };
        // Скрываем пароли и токены
        if (body.password) body.password = '***';
        if (body.token) body.token = '***';
        if (body.access_token) body.access_token = '***';
        console.log(`📄 Body:`, body);
    }
    
    // Перехватываем ответ
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        console.log(`📤 [${new Date().toISOString()}] Response ${res.statusCode} - ${duration}ms`);
        
        // Логируем ответ если включено в настройках
        if (enableResponseLogging && (res.statusCode >= 400 || process.env.NODE_ENV === 'development')) {
            try {
                const responseData = typeof data === 'string' ? JSON.parse(data) : data;
                console.log(`📋 Response:`, responseData);
            } catch (e) {
                console.log(`📋 Response (raw):`, data);
            }
        }
        
        return originalSend.call(this, data);
    };
    
    next();
}; 
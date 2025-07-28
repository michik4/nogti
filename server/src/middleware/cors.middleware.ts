import cors from 'cors';
import { Request } from 'express';

// Список разрешенных origins
const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:8080', // Vite dev server
    'http://localhost:3000', // альтернативный порт для клиента
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:4173', // Vite preview
];

// В продакшене добавить домены
if (process.env.NODE_ENV === 'production') {
    allowedOrigins.push(
        'https://yourdomain.com',
        'https://www.yourdomain.com'
    );
}

// CORS конфигурация
const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Разрешаем запросы без origin (например, мобильные приложения)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true, // Разрешаем отправку cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['X-Total-Count'], // Заголовки, доступные клиенту
    maxAge: 86400, // Кэширование preflight запросов на 24 часа
    optionsSuccessStatus: 200, // Для поддержки старых браузеров
};

export const corsMiddleware = cors(corsOptions); 
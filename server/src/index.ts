import dotenv from "dotenv";

dotenv.config();

import express from "express";
import path from "path";
import CONFIG from "./conf/global.conf";
import mainRoutes from "./routes/main.route";
import { getLogger, requestBodyLogger } from "./middleware/logger.middleware";
import { notFoundHandler, errorHandler, errorLogger, validateRequestBody } from "./middleware/error.middleware";
import { corsMiddleware } from "./middleware/cors.middleware";
import { initializeDatabase, closeDatabase } from "./conf/orm.conf";
import { ConsoleUtil as Console } from "./utils/console.util";

const app = express();

// CORS middleware
app.use(corsMiddleware);

// Статические файлы для аватаров и загрузок
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Логирование запросов к статическим файлам для отладки
app.use('/uploads', (req, res, next) => {
  console.log(`📁 Запрос к статическому файлу: ${req.path}`);
  next();
});

// middlewares
app.use(getLogger()); // автоматический выбор логгера по окружению
app.use(requestBodyLogger); // детальное логирование запросов
app.use(express.json());
app.use(validateRequestBody); // валидация тела POST запросов

// routes
app.use("/api", mainRoutes);

// Обработка ошибок (должна быть в конце после всех маршрутов)
app.use(notFoundHandler); // обработка 404 ошибок
app.use(errorLogger); // логирование ошибок
app.use(errorHandler); // общая обработка ошибок

// start server
app.listen(CONFIG.SERVER.PORT, async (error?: Error) => {
    if (error) {
        console.error(`Ошибка запуска сервера: ${error.message}`);
        process.exit(1);
    }

    Console.showSeparator();
    Console.showInfo('LOAD CONFIG');
    Console.showInfo(JSON.stringify(CONFIG, null, 2), false);
    Console.showInfo('END LOAD CONFIG');
    Console.showSeparator();

    await initializeDatabase();

    Console.showSuccess(`Server is running on ${CONFIG.SERVER.URL}...`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    Console.showWarning('Получен сигнал SIGTERM, завершение работы...');
    closeDatabase();
    process.exit(0);
});

process.on('SIGINT', () => {
    Console.showWarning('Получен сигнал SIGINT, завершение работы...');
    closeDatabase();
    process.exit(0);
});
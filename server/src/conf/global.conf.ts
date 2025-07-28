import dotenv from "dotenv";

const CONFIG = {
    SERVER: {
        PORT: Number(process.env.PORT) || 3000,
        HOST: process.env.HOST || "localhost",
        URL: '', // will be set later
        NODE_ENV: process.env.NODE_ENV || "development",
    },
    DB: {
        HOST: process.env.DB_HOST || "localhost",
        PORT: Number(process.env.DB_PORT) || 5432,
        USER: process.env.DB_USER || "postgres",
        PASSWORD: process.env.DB_PASSWORD || "postgres",
        NAME: process.env.DB_NAME || "postgres",
    },
    ORM: {
        SYNCHRONIZE: process.env.ORM_SYNCHRONIZE === "true" || false,
        LOGGING: process.env.ORM_LOGGING === "true" || false,
        MAX_QUERY_EXECUTION_TIME: Number(process.env.ORM_MAX_QUERY_EXECUTION_TIME) || 1000,
        CACHE: process.env.ORM_CACHE === "true" || false,
        CACHE_TTL: Number(process.env.ORM_CACHE_TTL) || 60000,
    }
};

// set the url
CONFIG.SERVER.URL = `http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`;

export const getConfig = () => {
    return CONFIG;
}

export const getDbConfig = () => {
    return CONFIG.DB;
}

export const getOrmConfig = () => {
    return CONFIG.ORM;
}



export default CONFIG;
import dotenv from 'dotenv';
dotenv.config();

export const PORT = parseInt(process.env.PORT || '4000', 10);
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
export const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);

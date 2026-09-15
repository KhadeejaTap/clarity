export const PORT = parseInt(process.env.PORT || '3001', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'clarity-dev-secret';
export const DB_PATH = process.env.DB_PATH || './clarity.db';

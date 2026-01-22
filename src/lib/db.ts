import { Pool } from 'pg';

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            user: process.env.DB_USER || 'saidheeraj',
            password: process.env.DB_PASSWORD || '',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'fixit_pos',
        }
);

export const query = async (text: string, params?: any[]) => {
    const res = await pool.query(text, params);
    return res;
};

export default pool;

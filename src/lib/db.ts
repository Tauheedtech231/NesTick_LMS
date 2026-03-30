import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '76.13.220.47',
  user: process.env.DB_USER || 'lms_user',
  password: process.env.DB_PASSWORD || 'StrongPass@456',
  database: process.env.DB_NAME || 'lms_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

declare global {
  var dbPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

if (process.env.NODE_ENV === 'development') {
  if (!global.dbPool) {
    global.dbPool = mysql.createPool(dbConfig);
  }
  pool = global.dbPool;
} else {
  pool = mysql.createPool(dbConfig);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}

export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw new Error('Failed to get database connection');
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { pool };
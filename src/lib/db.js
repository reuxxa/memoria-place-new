import { Pool } from 'pg';

let pool;

if (!global._pgPool) {
  global._pgPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

pool = global._pgPool;

export default pool;

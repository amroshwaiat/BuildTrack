const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'buildtrack_db',
  password: process.env.DB_PASSWORD || '0776285740', // استبدل بكلمة المرور الخاصة بك في البوستجري
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  console.log('تم الاتصال بقاعدة البيانات PostgreSQL بنجاح 🚀');
});

module.exports = pool;
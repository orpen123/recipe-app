const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipe_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Test connection on startup
pool.getConnection()
  .then(async (conn) => {
    console.log('✅ MySQL connected successfully');
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          related_id INT,
          message VARCHAR(255) NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Notifications table verified');
    } catch (e) {
      console.error('❌ Failed to create notifications table:', e.message);
    } finally {
      conn.release();
    }
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
  });

module.exports = pool;
const pool = require('./config/db');

async function runMigrations() {
  console.log('Running database migrations to fix missing columns and tables...');
  
  try {
    const conn = await pool.getConnection();

    try {
      console.log('1. Checking notifications table for related_id column...');
      await conn.query('ALTER TABLE notifications ADD COLUMN related_id INT').catch(e => {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        console.log('   - related_id column already exists in notifications.');
      });
      console.log('   ✅ Added related_id column to notifications (if missing).');

      console.log('2. Checking users table for bio column...');
      await conn.query('ALTER TABLE users ADD COLUMN bio TEXT').catch(e => {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        console.log('   - bio column already exists in users.');
      });
      console.log('   ✅ Added bio column to users (if missing).');

      console.log('2.5 Checking users table for is_admin column...');
      await conn.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE').catch(e => {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        console.log('   - is_admin column already exists in users.');
      });
      console.log('   ✅ Added is_admin column to users (if missing).');

      console.log('3. Checking users table for cover_index column...');
      await conn.query('ALTER TABLE users ADD COLUMN cover_index INT DEFAULT 0').catch(e => {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
        console.log('   - cover_index column already exists in users.');
      });
      console.log('   ✅ Added cover_index column to users (if missing).');

      console.log('4. Creating follows table if not exists...');
      await conn.query(`
        CREATE TABLE IF NOT EXISTS follows (
          follower_id INT NOT NULL,
          following_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('   ✅ follows table ready.');

    } finally {
      conn.release();
    }
    
    console.log('🎉 Migrations complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

runMigrations();

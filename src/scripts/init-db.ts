import { db } from '../lib/db';

async function initializeDatabase() {
  // Drop existing tables if they exist
  await db.execute(`DROP TABLE IF EXISTS pages`);
  await db.execute(`DROP TABLE IF EXISTS popular_searches`);

  // Create pages table with similarity column
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      content_vector BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create popular_searches table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS popular_searches (
      query_text TEXT PRIMARY KEY,
      success_count INTEGER DEFAULT 1,
      last_used DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
}

initializeDatabase().catch(console.error);
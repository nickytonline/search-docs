import { db } from './db';

export async function initializeDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding F32_BLOB(1536),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create vector index for similarity search
  await db.execute(`
    CREATE INDEX IF NOT EXISTS pages_embedding_idx
    ON pages(libsql_vector_idx(embedding, 'metric=cosine'))
  `);
}
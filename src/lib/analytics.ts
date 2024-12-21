import { db } from './db';

export interface SearchAnalytics {
  query: string;
  resultCount: number;
  duration: number;
  timestamp: Date;
  success: boolean;
}

export async function initializeAnalytics() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS search_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_hash TEXT NOT NULL,
      result_count INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN NOT NULL
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp
    ON search_analytics(timestamp)
  `);
}

export async function logSearch(analytics: SearchAnalytics) {
  // Hash the query to avoid storing personal information
  const queryHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(analytics.query)
  ).then(hash => Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  );

  await db.execute({
    sql: `
      INSERT INTO search_analytics (
        query_hash,
        result_count,
        duration_ms,
        success
      ) VALUES (?, ?, ?, ?)
    `,
    args: [
      queryHash,
      analytics.resultCount,
      analytics.duration,
      analytics.success
    ]
  });
}

export async function getSearchMetrics(days: number = 7) {
  return await db.execute({
    sql: `
      SELECT
        COUNT(*) as total_searches,
        AVG(duration_ms) as avg_duration,
        AVG(result_count) as avg_results,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_searches,
        SUM(CASE WHEN result_count = 0 THEN 1 ELSE 0 END) as zero_results
      FROM search_analytics
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
    `,
    args: [days]
  });
}
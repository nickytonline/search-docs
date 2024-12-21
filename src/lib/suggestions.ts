import { db } from './db';
import { initializeSuggestions } from './lib/suggestions';
import { expandSearchTerms } from './search-synonyms';

export interface Suggestion {
  text: string;
  type: 'title' | 'popular';
  score: number;
}

export async function initializeSuggestions() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS popular_searches (
      query_text TEXT PRIMARY KEY,
      success_count INTEGER DEFAULT 1,
      last_used DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function logSuccessfulSearch(query: string) {
  await db.execute({
    sql: `
      INSERT INTO popular_searches (query_text, success_count, last_used)
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(query_text) DO UPDATE SET
        success_count = success_count + 1,
        last_used = CURRENT_TIMESTAMP
    `,
    args: [query.toLowerCase().trim()]
  });
}

export async function getSuggestions(
  partial: string,
  limit: number = 5
): Promise<Suggestion[]> {
  if (!partial || partial.length < 2) return [];

  // Get expanded search terms
  const searchTerms = expandSearchTerms(partial);
  console.log('Expanded search terms:', searchTerms);

  // Create LIKE conditions for each term
  const likeConditions = searchTerms.map(term => `LOWER(title) LIKE ?`).join(' OR ');
  const likeParams = searchTerms.map(term => `%${term.toLowerCase()}%`);

  // Get matching titles with expanded search
  const titleResults = await db.execute({
    sql: `
      SELECT
        title as text,
        'title' as type,
        url,
        1 as score
      FROM pages
      WHERE ${likeConditions}
      GROUP BY url
      LIMIT ?
    `,
    args: [...likeParams, limit]
  });

  console.log('Raw query results:', titleResults);
  console.log('Result rows:', titleResults.rows);

  const suggestions: Suggestion[] = titleResults.rows.map(row => ({
    url: row.url as string,
    text: row.text as string,
    type: row.type as 'title',
    score: row.score as number
  }));

  return suggestions.slice(0, limit);
}

// Initialize suggestions table
await initializeSuggestions();
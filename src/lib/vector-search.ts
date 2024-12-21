import { db } from './db';

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  similarity: number;
}

export async function vectorSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const likePatterns = searchTerms.map(term => `%${term}%`);

    const results = await db.execute({
      sql: `
        SELECT
          url,
          title,
          substr(content, 1, 200) as content,
          (
            /* Simple ranking based on matches in title and content */
            CASE
              WHEN title LIKE ? THEN 2
              WHEN content LIKE ? THEN 1
              ELSE 0
            END
          ) as relevance
        FROM pages
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY relevance DESC
        LIMIT ?
      `,
      args: [
        likePatterns[0], // for title match
        likePatterns[0], // for content match
        likePatterns[0], // for WHERE clause title
        likePatterns[0], // for WHERE clause content
        limit
      ]
    });

    return results.rows.map(row => ({
      url: row.url as string,
      title: row.title as string,
      content: row.content as string,
      similarity: (row.relevance as number) / 2 // Normalize to 0-1 range
    }));

  } catch (error) {
    console.error('Vector search failed:', error);
    throw error;
  }
}
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
    const term = searchTerms[0]; // Using first term for simplicity

    const results = await db.execute({
      sql: `
        SELECT
          url,
          title,
          substr(content, 1, 200) as content,
          (
            CASE
              WHEN title LIKE '% ' || ? || ' %'
                OR title LIKE '(' || ? || ')'
                OR title LIKE ? || ' %'
                OR title LIKE '% ' || ?
                OR title = ? THEN 2
              WHEN content LIKE '% ' || ? || ' %'
                OR content LIKE '(' || ? || ')'
                OR content LIKE ? || ' %'
                OR content LIKE '% ' || ?
                OR content = ? THEN 1
              ELSE 0
            END
          ) as relevance
        FROM pages
        WHERE
          title LIKE '% ' || ? || ' %'
          OR title LIKE '(' || ? || ')'
          OR title LIKE ? || ' %'
          OR title LIKE '% ' || ?
          OR title = ?
          OR content LIKE '% ' || ? || ' %'
          OR content LIKE '(' || ? || ')'
          OR content LIKE ? || ' %'
          OR content LIKE '% ' || ?
          OR content = ?
        ORDER BY relevance DESC
        LIMIT ?
      `,
      args: [
        term, term, term, term, term, // for title relevance
        term, term, term, term, term, // for content relevance
        term, term, term, term, term, // for title WHERE clause
        term, term, term, term, term, // for content WHERE clause
        limit
      ]
    });

    return results.rows.map(row => ({
      url: row.url as string,
      title: row.title as string,
      content: row.content as string,
      similarity: (row.relevance as number) / 2
    }));

  } catch (error) {
    console.error('Vector search failed:', error);
    throw error;
  }
}
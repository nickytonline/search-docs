import type { APIRoute } from 'astro';
import { getSuggestions } from '../../lib/suggestions';

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const query = url.searchParams.get('q');

    if (!query) {
      console.log('No query provided');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const suggestions = await getSuggestions(query);

    return new Response(JSON.stringify(suggestions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Netlify-CDN-Cache-Control': 'public, durable, max-age=3660, stale-while-revalidate=60',
        'Netlify-Vary': 'q'
      }
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch suggestions' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
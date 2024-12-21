import type { APIRoute } from 'astro';
import { getSuggestions } from '../../lib/suggestions';

export const GET: APIRoute = async ({ url, request }) => {
  try {
    // Log the full URL and search params
    console.log('Full URL:', url.toString());
    console.log('All search params:', Object.fromEntries(url.searchParams));

    const query = url.searchParams.get('q');
    console.log('Query parameter:', query);

    // Also log the raw request URL as a backup
    console.log('Request URL:', request.url);

    if (!query) {
      console.log('No query provided');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Calling getSuggestions with:', query);
    const suggestions = await getSuggestions(query);
    console.log('getSuggestions returned:', suggestions);

    return new Response(JSON.stringify(suggestions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
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
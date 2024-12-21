interface HighlightOptions {
  maxLength?: number;
  beforeContext?: number;
  afterContext?: number;
  highlightClass?: string;
}

export function highlightText(
  text: string,
  query: string,
  options: HighlightOptions = {}
) {
  const {
    maxLength = 200,
    beforeContext = 50,
    afterContext = 100,
    highlightClass = 'bg-yellow-100'
  } = options;

  // Split query into terms and remove empty strings
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 0);

  // Find the best matching position
  let bestPosition = 0;
  let bestMatchCount = 0;

  const textLower = text.toLowerCase();

  terms.forEach(term => {
    let pos = 0;
    while ((pos = textLower.indexOf(term, pos)) !== -1) {
      let matchCount = 0;
      terms.forEach(t => {
        const nearby = textLower.slice(
          Math.max(0, pos - beforeContext),
          Math.min(text.length, pos + afterContext)
        );
        if (nearby.includes(t)) matchCount++;
      });

      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestPosition = pos;
      }
      pos += term.length;
    }
  });

  // Extract relevant snippet
  let start = Math.max(0, bestPosition - beforeContext);
  let end = Math.min(text.length, bestPosition + afterContext);

  // Adjust to not break words
  while (start > 0 && /\S/.test(text[start - 1])) start--;
  while (end < text.length && /\S/.test(text[end])) end++;

  let snippet = text.slice(start, end);

  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  // Highlight terms using HTML encoding
  terms.forEach(term => {
    // Escape special characters in the term for regex
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    snippet = snippet.replace(regex, (match) => {
      // HTML encode the matched text
      const encoded = match
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return `<mark class="${highlightClass}">${encoded}</mark>`;
    });
  });

  return snippet;
}
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { Suggestion } from '../lib/suggestions';

interface Props {
  initialQuery: string;
}

export function SearchAutocomplete({ initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeout = useRef<NodeJS.Timeout>();
  const blurTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2 || !showSuggestions) {
        setSuggestions([]);
        return;
      }

      try {
        const url = `/api/suggestions?q=${encodeURIComponent(query)}`;
        console.log('Fetching suggestions from:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Suggestions received:', data);
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          const errorText = await response.text();
          console.error('API error:', errorText);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };

    console.log('Query changed:', query);
    clearTimeout(suggestionTimeout.current);
    suggestionTimeout.current = setTimeout(fetchSuggestions, 150);

    return () => clearTimeout(suggestionTimeout.current);
  }, [query, showSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const selected = suggestions[selectedIndex];
          setQuery(selected.text);
          setShowSuggestions(false);
          inputRef.current?.form?.submit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleBlur = () => {
    // Clear any existing blur timeout
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
    }
    // Set a new timeout to hide suggestions
    blurTimeout.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 200); // 200ms delay
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Clear the blur timeout to prevent hiding suggestions
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
    }
    // Close the suggestions dropdown
    setShowSuggestions(false);
    // Navigate to the URL
    window.location.href = suggestion.url;
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder="Search documentation..."
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
        aria-label="Search query"
        aria-expanded={showSuggestions}
        aria-controls="search-suggestions"
        aria-activedescendant={
          selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
        }
        role="combobox"
        autoComplete="off"
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={`
                px-4 py-2 cursor-pointer flex items-center gap-2
                ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-700
              `}
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              <a
                href={suggestion.url}
                className="flex-1 flex items-center gap-2"
                onClick={(e) => e.preventDefault()} // Prevent default to allow handleSuggestionClick to handle navigation
              >
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: suggestion.text }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {suggestion.type === 'popular' ? 'Popular' : 'Title'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
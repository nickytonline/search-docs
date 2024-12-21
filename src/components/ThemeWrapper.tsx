import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

export function ThemeWrapper() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}
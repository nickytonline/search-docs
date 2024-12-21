/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  theme: {
    extend: {
      // You can customize these colors to match Pomerium's exact brand colors
      colors: {
        primary: {
          DEFAULT: '#6941C6', // Pomerium purple
          dark: '#EAB308',    // Yellow for dark mode
        },
      },
    },
  },
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1a1814',
          muted: '#6b6560',
          faint: '#a39e96',
        },
        paper: {
          DEFAULT: '#f6f3ec',
          card: '#fffcf7',
          sunk: '#ebe6dc',
        },
        male: {
          DEFAULT: '#2f6fed',
          soft: '#dce8ff',
          dark: '#1e4bb8',
        },
        female: {
          DEFAULT: '#d4538b',
          soft: '#fce0ec',
          dark: '#a83264',
        },
        fictional: {
          DEFAULT: '#2f9e6b',
          soft: '#d7f3e6',
          dark: '#1f7a50',
        },
        wildcard: {
          DEFAULT: '#7c4dcc',
          soft: '#ebe0ff',
          dark: '#5a32a0',
        },
        chosen: {
          DEFAULT: '#2f9e44',
          soft: '#d8f5de',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(26 24 20 / 0.04), 0 8px 24px rgb(26 24 20 / 0.06)',
        lift: '0 4px 16px rgb(26 24 20 / 0.1)',
      },
    },
  },
  plugins: [],
}

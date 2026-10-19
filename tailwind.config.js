/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // Ocean Teal
          dark: '#042F2E',
          light: '#14B8A6',
          container: '#CCFBF1',
        },
        emerald: {
          accent: '#10B981',
        },
        amber: {
          accent: '#F59E0B',
        },
        rose: {
          accent: '#E11D48',
        },
        cream: {
          paper: '#FDFBF7',
          surface: '#F8FAF9',
        },
        slate: {
          dark: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669', // Emerald
          dark: '#047857',
          light: '#10B981',
          accent: '#34D399',
          muted: 'rgba(16, 185, 129, 0.1)',
        },
        surface: {
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
          darkBg: '#09090B', // True deep Zinc
          darkCard: '#121215', // Premium surface
          darkBorder: '#27272A', // Hairline Zinc-800
          darkElevated: '#18181B', // Elevated layer
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}

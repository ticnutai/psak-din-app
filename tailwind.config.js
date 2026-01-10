/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy Blue - Primary
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        // Gold - Accent
        gold: {
          50: '#fefdf8',
          100: '#fdf9e8',
          200: '#faf0c8',
          300: '#f5e3a0',
          400: '#ecd06d',
          500: '#C9A227', // Main gold
          600: '#b8922a',
          700: '#9a7a23',
          800: '#7d631d',
          900: '#664f18',
        },
        // Cream/Beige for backgrounds
        cream: {
          50: '#fefefe',
          100: '#fdfcfa',
          200: '#faf8f3',
          300: '#f5f2ea',
          400: '#ebe6d9',
          500: '#e0d9c8',
          600: '#c9c0ab',
          700: '#a89f89',
          800: '#87806e',
          900: '#6e685a',
        },
        // Gray for subtle elements
        mouse: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        'hebrew': ['David Libre', 'Frank Ruhl Libre', 'Noto Sans Hebrew', 'sans-serif'],
        'serif': ['Frank Ruhl Libre', 'David Libre', 'serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(201, 162, 39, 0.25)',
        'gold-lg': '0 10px 40px -10px rgba(201, 162, 39, 0.35)',
        'elegant': '0 4px 20px -2px rgba(16, 42, 67, 0.08)',
        'card': '0 2px 8px -2px rgba(16, 42, 67, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

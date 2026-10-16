/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F6FF',
          100: '#E0EEFF',
          200: '#BAE0FD',
          300: '#7DC4FA',
          400: '#38A3F5',
          500: '#0394D7',
          600: '#1B4591',
          700: '#163a7a',
          800: '#132e60',
          900: '#0d1f42',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        neon: '#ff1744',
        electric: '#ffea00',
        purpleg: '#a855f7',
      },
      fontFamily: {
        display: ['"Bangers"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
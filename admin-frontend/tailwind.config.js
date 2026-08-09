/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f2',
          100: '#fbe5e5',
          200: '#f7cfcf',
          300: '#efa8a8',
          400: '#e17878',
          500: '#ca4b4b',
          600: '#b23535',
          700: '#952727',
          800: '#800000', // Primary Maroon
          900: '#670a0a',
          950: '#410404',
        },
        gold: {
          50: '#fefbeb',
          100: '#fef3c7',
          200: '#fde58a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#b8e5e5',
          100: '#a8d5d5',
          200: '#98c5c5',
          300: '#87c5c5',
          400: '#6dd5d5',
          500: '#5dd5d5', 
          600: '#4dc5c5',
        }
      },
    },
  },
  plugins: [],
}
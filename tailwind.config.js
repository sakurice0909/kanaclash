/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Zen Maru Gothic"', 'sans-serif'],
        heading: ['"Mochiy Pop One"', 'sans-serif'],
      },
      colors: {
        primary: {
          400: '#818cf8', // Indigo 400
          500: '#6366f1', // Indigo 500
          600: '#4f46e5', // Indigo 600
        }
      }
    },
  },
  plugins: [],
}

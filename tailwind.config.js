/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        heading: ['"Shippori Mincho B1"', 'serif'],
      },
      colors: {
        ai: '#1a1a2e',
        kon: '#16213e',
        shu: {
          DEFAULT: '#c73e3a',
          dark: '#a63030',
          light: '#e05550',
        },
        kin: {
          DEFAULT: '#c9a84c',
          light: '#e8d48b',
          dark: '#a68a3a',
        },
        kinari: '#f5f0e1',
        sumi: '#2d2d3d',
        hai: '#8b8b9e',
        beni: '#b4436c',
        matcha: {
          DEFAULT: '#6b8e5a',
          light: '#8fb87a',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'compact': { 'raw': '(max-height: 500px)' },
      },
    },
  },
  plugins: [],
}

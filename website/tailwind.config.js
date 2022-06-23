/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-dark': '#363636',
        'background-light': '#f5f5f5',
      }
    },
  },
  plugins: [
    require('tailwindcss-debug-screens'),
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9f0',
          100: '#dcf0dc',
          500: '#00a82d',
          600: '#008c25',
          700: '#00701e',
        },
      },
    },
  },
  plugins: [],
};

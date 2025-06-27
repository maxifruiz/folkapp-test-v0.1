/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        folkiRed: '#7f1d1d',
        folkiAmber: '#fbbf24',
        folkiCream: '#fef3c7',
      },
      boxShadow: {
        neon: '0 0 10px rgba(255, 0, 100, 0.5)',
      },
    },
  },
  plugins: [],
};

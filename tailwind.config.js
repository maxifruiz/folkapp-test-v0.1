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
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeLeft: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-left': 'fadeLeft 0.7s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar'), // 👉 agregado para scroll estético
  ],
};

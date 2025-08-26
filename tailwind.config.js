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
        'btn-shadow': '0 2px 8px rgba(0,0,0,0.15)', // sombra sutil botón
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
        pulseButton: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 5px rgba(255, 220, 100, 0.6)' },
          '50%': { transform: 'scale(1.1)', boxShadow: '0 0 15px rgba(255, 220, 100, 0.8)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 5px rgba(255, 220, 100, 0.6)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-left': 'fadeLeft 0.7s ease-out forwards',
        'pulse-button': 'pulseButton 2s ease-in-out infinite',
      },
      spacing: {
        'btn-px': '0.75rem', // para px padding más claro si quieres
      },
      borderRadius: {
        'btn-rounded': '9999px', // botón full rounded
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar'), // 👉 agregado para scroll estético
  ],
};

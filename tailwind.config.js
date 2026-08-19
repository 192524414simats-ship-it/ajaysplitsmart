/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf6', 100: '#d6f9e9', 200: '#b0f1d6', 300: '#7ce4bd',
          400: '#41ce9d', 500: '#19b383', 600: '#0c9069', 700: '#0a7357',
          800: '#0b5b46', 900: '#0b4a3b', 950: '#052a21',
        },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0,0,0,0.08), 0 8px 24px -4px rgba(0,0,0,0.06)',
        card: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.08)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        slideUp: 'slideUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

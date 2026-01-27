/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      animation: {
        'pulse-urgent': 'pulse-urgent 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-urgent': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
            borderColor: 'rgb(239, 68, 68)',
          },
          '50%': {
            boxShadow: '0 0 20px 10px rgba(239, 68, 68, 0.3)',
            borderColor: 'rgb(248, 113, 113)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

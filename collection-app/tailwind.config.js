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
        // Vert Fluo Électrique - Vibrant Green
        electric: {
          50: '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4',
          300: '#68d391',
          400: '#48bb78',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          // Vert Fluo Principal
          glow: '#00FF66',
          bright: '#22FF66',
          neon: '#39FF14',
        },
      },
      animation: {
        'pulse-urgent': 'pulse-urgent 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'slide-out-left': 'slide-out-left 0.4s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
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
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-left': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-30px)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px 3px rgba(0, 255, 102, 0.5), 0 0 30px 6px rgba(0, 255, 102, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 20px 5px rgba(0, 255, 102, 0.7), 0 0 40px 10px rgba(0, 255, 102, 0.4)',
          },
        },
      },
      boxShadow: {
        'electric-glow': '0 0 15px 3px rgba(0, 255, 102, 0.5), 0 0 30px 6px rgba(0, 255, 102, 0.3)',
        'electric-glow-lg': '0 0 20px 5px rgba(0, 255, 102, 0.6), 0 0 40px 10px rgba(0, 255, 102, 0.4)',
      },
    },
  },
  plugins: [],
}

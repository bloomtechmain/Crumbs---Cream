/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50:  '#fdf8f3',
          100: '#f5e8d8',
          200: '#e8c9a0',
          300: '#d4a96a',
          400: '#c08040',
          500: '#8B5E3C',
          600: '#6B4423',
          700: '#4A2C15',
          800: '#2E1A0E',
          900: '#1a0f08',
        },
        cream: {
          50:  '#fffdf9',
          100: '#fdf6ec',
          200: '#f9ecd5',
          300: '#f3dbb0',
          400: '#eac882',
          500: '#deb45a',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'sans-serif'],
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        ticker:   'ticker 30s linear infinite',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}

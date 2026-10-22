import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        // Palette matched to the new logo: deep chocolate brown for text and
        // dark accents, warm caramel/champagne for borders and highlights.
        brown: {
          50:  '#faf4ec',
          100: '#f1e4d4',
          200: '#e2c8ab',
          300: '#c39a76',
          400: '#94623f',
          500: '#7a4a2a',
          600: '#5f3216',
          700: '#4b2410',
          800: '#361909',
          900: '#211005',
        },
        // Soft ivory backgrounds (50–100) through to warm taupe (200–300)
        // for secondary sections and cards.
        cream: {
          50:  '#fdfaf3',
          100: '#f8f1e4',
          200: '#ece1d2',
          300: '#ddcfbd',
          400: '#cfbca0',
          500: '#b8a284',
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

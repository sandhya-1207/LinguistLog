/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mocha: {
          bg: '#F5EFE7',
          surface: '#FFF9F2',
          primary: '#755744',
          'primary-hover': '#5E4332',
          accent: '#C8AD96',
          'accent-light': '#EFE7DF',
          text: '#352820',
          muted: '#766456',
          border: '#E4D7CC',
          card: '#FFFDF9',
        },
        forest: {
          bg: '#17251D',
          surface: '#203128',
          primary: '#3F6650',
          'primary-hover': '#325240',
          accent: '#A7BDA9',
          'accent-dark': '#2A3F33',
          text: '#E8F0E8',
          muted: '#9CB29F',
          border: '#2C4236',
          card: '#1D2D23',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

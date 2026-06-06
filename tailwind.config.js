import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.slate,
        primary: '#2563EB',
        dark: '#0F172A',
        success: '#22C55E',
        background: '#F8FAFC',
      },
      fontFamily: {
        sans: ['"Asap Condensed"', 'sans-serif'],
        heading: ['Newake', '"Bebas Neue"', 'sans-serif'],
        flex: ['"Roboto Flex"', 'sans-serif'],
        serif: ['adobe-garamond-pro', 'serif'],
        grotesk: ['aktiv-grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

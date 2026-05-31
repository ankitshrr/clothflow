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
      }
    },
  },
  plugins: [],
};

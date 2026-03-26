/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#1a3a6b',
          blue: '#2d5fa6',
          orange: '#f15a22',
          dark: '#0a1f44',
          bg: '#f5f7fa',
          border: '#e8ecf0',
          table: '#dce8f5',
          stripe: '#f0f5fb',
        },
      },
      fontFamily: {
        sans: ['Noto Sans', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

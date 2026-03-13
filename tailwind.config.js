/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#111111',
          muted: '#8a8a8a',
        },
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}

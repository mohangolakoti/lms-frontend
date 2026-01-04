/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#cae8ff',
          100: '#b2e4ff',
          200: '#acf4ff',
          300: '#60b9e9',
          400: '#00aeef',
          500: '#05c1dd',
          600: '#059aef',
          700: '#05aee5',
          800: '#05d4d8',
          900: '#0484fa',
        },
        dark: {
          50: '#050a30',
          100: '#1b75bc',
        },
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcfd',
          100: '#d5f6f9',
          200: '#aeeef3',
          300: '#7fdfea',
          400: '#42c8de',
          500: '#15adc8',
          600: '#0f8da9',
          700: '#117188',
          800: '#145b6e',
          900: '#154c5d',
          950: '#073340',
        },
        primary: {
          50: '#eefcfd',
          100: '#d5f6f9',
          200: '#aeeef3',
          300: '#7fdfea',
          400: '#42c8de',
          500: '#15adc8',
          600: '#0f8da9',
          700: '#117188',
          800: '#145b6e',
          900: '#154c5d',
        },
        surface: {
          page: '#f5fafb',
          card: '#ffffff',
          muted: '#eef4f6',
        },
        text: {
          base: '#13212b',
          muted: '#4f6270',
          subtle: '#6f8593',
          inverse: '#f8fcff',
        },
        line: {
          soft: '#d7e4ea',
          strong: '#afc3cc',
        },
        success: {
          50: '#edfdf5',
          100: '#d2f9e4',
          600: '#1f8f58',
          700: '#166945',
        },
        warning: {
          50: '#fff7e8',
          100: '#fdebc8',
          600: '#b5660b',
          700: '#8f4d06',
        },
        danger: {
          50: '#fff1f2',
          100: '#ffe0e2',
          600: '#ca2f44',
          700: '#a52537',
        },
        info: {
          50: '#eef7ff',
          100: '#d8ebff',
          600: '#216bcb',
          700: '#1d56a4',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 41, 53, 0.06), 0 8px 24px rgba(18, 41, 53, 0.06)',
      },
    },
  },
  plugins: [],
}


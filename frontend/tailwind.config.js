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
          DEFAULT: '#0040a1',
          50: '#e8eeff',
          100: '#dae2ff',
          200: '#b2c5ff',
          300: '#8ba8ff',
          400: '#648bff',
          500: '#3d6eff',
          600: '#0040a1',
          700: '#003587',
          800: '#00296d',
          900: '#001847',
        },
        secondary: {
          DEFAULT: '#5b00df',
          50: '#f3e8ff',
          100: '#e8ddff',
          200: '#cfbdff',
          300: '#b69dff',
          400: '#9d7dff',
          500: '#845dff',
          600: '#5b00df',
          700: '#4a00b8',
          800: '#390091',
          900: '#22005d',
        },
        tertiary: {
          DEFAULT: '#005145',
          50: '#e6f7f4',
          100: '#d0ede6',
          200: '#a4d9cf',
          300: '#78c5b8',
          400: '#4cb1a1',
          500: '#209d8a',
          600: '#005145',
          700: '#004238',
          800: '#00332b',
          900: '#00201a',
        },
        surface: {
          brightest: '#ffffff',
          bright: '#f8f9fa',
          DEFAULT: '#f8f9fa',
          container: {
            lowest: '#ffffff',
            low: '#f3f4f5',
            DEFAULT: '#edeeef',
            high: '#e7e8e9',
            highest: '#e1e3e4',
          },
          dim: '#d9dadb',
        },
        onSurface: {
          DEFAULT: '#191c1d',
          variant: '#424654',
        },
        outline: {
          DEFAULT: '#737785',
          variant: '#c3c6d6',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
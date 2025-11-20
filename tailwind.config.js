/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
    './src/domains/**/*.{js,jsx}',
    './src/shared/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          darkest: '#040D12',
          dark: '#183D3D',
          DEFAULT: '#5C8374',
          light: '#93B1A6',
        },
        dark: '#040D12',
        teal: {
          dark: '#183D3D',
          DEFAULT: '#5C8374',
          light: '#93B1A6',
        }
      },
    },
  },
  plugins: [],
}


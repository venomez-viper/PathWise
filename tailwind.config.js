/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
      },
      rotate: {
        '60': '60deg',
        '70': '70deg',
      },
      brightness: {
        '130': '1.30',
        '135': '1.35',
        '140': '1.40',
      },
      transitionDuration: {
        '2000': '2000ms',
        '4000': '4000ms',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

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
      colors: {
        primary: {
          DEFAULT: '#6245a4',
          dark: '#4a3280',
          light: '#a78bfa',
          container: '#7b5ebf',
          fixed: '#e9ddff',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#006a62',
          container: '#5ef6e6',
          light: '#00a396',
          foreground: '#ffffff',
        },
        copper: '#8b4f2c',
        surface: {
          DEFAULT: '#faf9fe',
          lowest: '#ffffff',
          low: '#f4f3f8',
          container: '#efecf5',
          high: '#e8e6ef',
          highest: '#e0deea',
        },
        /* shadcn/ui semantic tokens mapped to PathWise design system */
        background: '#ffffff',
        foreground: '#1a1c1f',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1c1f',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1a1c1f',
        },
        muted: {
          DEFAULT: '#e8f6f8',
          foreground: '#78747e',
        },
        accent: {
          DEFAULT: '#e8f6f8',
          foreground: '#1a1c1f',
        },
        destructive: {
          DEFAULT: '#e53935',
          foreground: '#ffffff',
        },
        border: 'rgba(73, 69, 79, 0.15)',
        input: 'rgba(73, 69, 79, 0.15)',
        ring: '#6245a4',
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
      },
      boxShadow: {
        'ambient-sm': '0 2px 20px rgba(98, 69, 164, 0.04)',
        'ambient-md': '0 4px 40px rgba(98, 69, 164, 0.06)',
        'ambient-lg': '0 12px 60px rgba(98, 69, 164, 0.10)',
        'ambient-glow': '0 0 40px rgba(98, 69, 164, 0.20)',
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

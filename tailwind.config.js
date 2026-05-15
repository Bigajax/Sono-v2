/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F5F0',
        night: '#08090F',
        dusk: '#0C0D1A',
        ink: '#12121E',
        'ink-light': '#6E6B85',
        'ink-muted': '#A8A4B8',
        accent: '#6b4fbb',
        'accent-soft': '#EDE9F7',
        'accent-mid': '#9D97CC',
        gold: '#C4913C',
        'gold-light': '#D4A857',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '18px',
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '25': '6.25rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse, var(--tw-gradient-stops))',
      },
      keyframes: {
        marqueeLeft: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        marqueeRight: {
          from: { transform: 'translate3d(-50%, 0, 0)' },
          to: { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'marquee-left': 'marqueeLeft 30s linear infinite',
        'marquee-right': 'marqueeRight 26s linear infinite',
      },
    },
  },
  plugins: [],
};

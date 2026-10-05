/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        surface: '#131316',
        card: '#17171B',
        line: '#26262C',
        volt: '#D4FF3F',
        voltdim: '#A8CC33',
        muted: '#A1A1AA',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(212, 255, 63, 0.25)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};

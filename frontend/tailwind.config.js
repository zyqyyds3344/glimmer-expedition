/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glimmer: {
          gold: '#FFD86B',
          purple: '#9C6BFF',
          blue: '#5BA8FF',
          deep: '#0B0A1F',
          deeper: '#06051A',
          panel: '#161430',
          mist: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        display: ['"ZCOOL XiaoWei"', 'serif'],
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%,100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
        glow: {
          '0%,100%': { filter: 'drop-shadow(0 0 8px #FFD86B)' },
          '50%': { filter: 'drop-shadow(0 0 24px #FFD86B)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        glow: 'glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        blue: {
          50:  "#F4F0FF",
          100: "#E6DEFF",
          200: "#D0C2FF",
          300: "#B8A6FF",
          400: "#A088FF",
          500: "#7C4DFF",
          600: "#6A3FE0",
          700: "#5A34C4",
          800: "#482A9E",
          900: "#2F1B66",
        },

        // ✔️ Tus colores personalizados (DENTRO de extend.colors)
        beige: {
          DEFAULT: "#FFF8EE",
        },
        yellow: {
          soft: "#FFEB99",
        },
        grayneutral: {
          DEFAULT: "#6F6F6F",
        },
      },

      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Blue Colors
        primary: {
          DEFAULT: '#007ED3',
          light: '#35AEFF',
          pale: '#BFDBFE',
        },
        // Grayscale Colors
        gray: {
          100: '#FFFFFF',
          200: '#F3F4F6',
          300: '#E2E8F0',
          400: '#E5E7EB',
          500: '#D1D5DB',
          600: '#99A0AD',
          700: '#64748B',
          800: '#4B5563',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // H1
        'h1': ['60px', { lineHeight: '75px', fontWeight: '700' }],
        // H2
        'h2': ['30px', { lineHeight: '36px', fontWeight: '700' }],
        // H3
        'h3': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        // H4
        'h4': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        // H5
        'h5': ['20px', { lineHeight: '30px', fontWeight: '700' }],
        // Body XL
        'body-xl': ['20px', { lineHeight: '30px', fontWeight: '400' }],
        // Body L Bold
        'body-l-bold': ['18px', { lineHeight: '28px', fontWeight: '700' }],
        // Body L
        'body-l': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        // Body M Bold
        'body-m-bold': ['16px', { lineHeight: '20px', fontWeight: '600' }],
        // Body M
        'body-m': ['16px', { lineHeight: '20px', fontWeight: '400' }],
        // Body S Bold
        'body-s-bold': ['14px', { lineHeight: '20px', fontWeight: '700' }],
        // Body S
        'body-s': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
      backgroundImage: {
        'gradient-bg': 'linear-gradient(135deg, #FFFCF5 0%, #F2F9FF 41%, #EEF3FD 62%, #FFEDF8 100%)',
        'gradient-cta': 'linear-gradient(135deg, #00A5B8 14%, #4E4BEA 100%)',
      },
    },
  },
  plugins: [],
};
export default config;


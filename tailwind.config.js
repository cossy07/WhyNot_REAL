/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B3F6E',
          50:  '#EEF3FA',
          100: '#D6E3F4',
          200: '#ADC6E9',
          300: '#84AADE',
          400: '#5B8DD3',
          500: '#3271C8',
          600: '#265AAE',
          700: '#1B3F6E',
          800: '#122B4A',
          900: '#091627',
        },
        accent: {
          DEFAULT: '#F4845F',
          50:  '#FEF4F0',
          100: '#FDE4DA',
          200: '#FBBFAD',
          300: '#F9A080',
          400: '#F4845F',
          500: '#F06030',
          600: '#D44A1A',
          700: '#A63814',
          800: '#78270E',
          900: '#4A1708',
        },
        neutral: {
          charcoal: '#2D2D2D',
        },
        bg: '#FAFAF8',
        surface: '#FFFFFF',
        muted: '#6B7280',
        success: '#4CAF72',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

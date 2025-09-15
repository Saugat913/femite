import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        '3xl': '1680px',
      },
      colors: {
        hemp: {
          'green-light': '#E8F5E8',
          'green-medium': '#87B087',
          'green-dark': '#5A7C5A',
          'beige': '#F8F6F2',
          'text': '#1F2937',
          'accent': '#6B7280',
          'muted': '#9CA3AF',
        },
      },
      fontFamily: {
        'inter': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config

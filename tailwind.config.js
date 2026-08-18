/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0C79F7',
        'primary-dark': '#075FC4',
        accent: '#93C5FD',
        navy: '#082B5C',
        mist: '#EFF6FF',
      },
      boxShadow: {
        soft: '0 18px 50px -20px rgba(12, 121, 247, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4880FF',
        'primary-dark': '#4880FF',
        accent: '#f3b61f',
        navy: '#4880FF',
        mist: '#F1F5FF',
      },
      boxShadow: {
        soft: '0 18px 50px -20px rgba(72, 128, 255, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#18181b',  // zinc-900 — cards
          raised:  '#27272a',  // zinc-800 — inputs, elevated
        },
      },
    },
  },
  plugins: [],
}

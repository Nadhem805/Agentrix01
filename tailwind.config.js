/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#6C3BFF',
        secondary:  '#3BA9FF',
        accent:     '#A84FFF',
        background: '#0E0E12',
        surface:    '#16161C',
        card:       '#1C1C24',
        border:     '#2A2A38',
      },
    },
  },
  plugins: [],
}

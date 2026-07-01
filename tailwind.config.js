/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          600: 'var(--primary-600)',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}

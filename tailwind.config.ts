/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './components/**/*.{vue,js}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './composables/**/*.{js,ts}',
        './api/**/*.{js,ts}',
        './App.{js,ts,vue}',
        './app.{js,ts,vue}',
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [],
}
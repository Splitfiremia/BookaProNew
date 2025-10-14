/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f07945",
        secondary: "#909099",
        background: "#000000",
        text: "#ffffff",
      },
      fontFamily: {
        lufea: ["Lufea", "sans-serif"],
      },
    },
  },
  plugins: [],
};
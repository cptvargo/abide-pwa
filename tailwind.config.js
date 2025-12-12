/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        abideGold: "#d4a76a",
        abideDark: "#161616",
        abideDark2: "#1f1f1f",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      }
    },
  },
  plugins: [],
};

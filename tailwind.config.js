/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./*.{html,js}", "./input.css"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};

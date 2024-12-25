/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./node_modules/flowbite/**/*.js",
    "./pages/**/*.{html,js}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("flowbite/plugin")],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF0000", // Red from the design
        background: "#000000",
        surface: "#111111",
        secondary: "#A1A1A1",
      },
    },
  },
  plugins: [],
};

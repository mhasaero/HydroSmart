/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        water: {
          primary: "#82adfe",
          secondary: "#A9D6E5",
          dark: "#5a8bc9",
          bg: "#F0F9FF",
        },
      },
    },
  },
  plugins: [],
};

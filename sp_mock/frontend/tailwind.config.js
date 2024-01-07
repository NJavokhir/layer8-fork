/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [ {
      custom: {
        "primary": "#4caf50",
        // "secondary": "#f6d860",
        // "accent": "#37cdbe",
        // "neutral": "#3d4451",
        // "base-100": "#ffffff",
      },
    },
    "light", "dark", "cupcake"],
  },
}


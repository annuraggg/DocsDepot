/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        raleway: ["Raleway", "sans-serif"], // Add the font family
        poppins: ["Poppins", "sans-serif"], // Add the font family
        roboto: ["Roboto", "sans-serif"], // Add the font family
        familjen: ["Familjen Grotesk Variable", "sans-serif"], // Add the font family
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        stroke: "stroke 5s forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        stroke: {
          "0%": {
            fill: "rgba(72, 138, 20, 0)",
            stroke: "rgba(54, 95, 160, 1)",
            strokeDashoffset: "25%",
            strokeDasharray: "0 50%",
          },
          "70%": {
            fill: "rgba(72, 138, 20, 0)",
            stroke: "rgba(54, 95, 160, 1)",
          },
          "80%": {
            fill: "rgba(72, 138, 20, 0)",
            stroke: "rgba(54, 95, 160, 1)",
          },
          "100%": {
            fill: "rgba(72, 138, 204, 1)",
            stroke: "rgba(54, 95, 160, 0)",
          },
        },
      },
    },
  },
  plugins: [],
};

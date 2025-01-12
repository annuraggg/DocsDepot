import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        50: { value: "#e6f2ff" },
        100: { value: "#e6f2ff" },
        200: { value: "#bfdeff" },
        300: { value: "#99caff" },
        // ...
        950: { value: "#001a33" },
        primary: {
          50: { value: "#E6FFFA" },
          100: { value: "#B2F5EA" },
          // Define other shades here
        },
        primaryDark: {
          50: { value: "#112233" },
          100: { value: "#001122" },
          // Define other shades here
        },

        solid: { value: "{colors}" },
      },
      fonts: {
        heading: { value: "'Poppins', sans-serif" },
        body: { value: "'Poppins', sans-serif" },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);
export default system;

import defaultTheme from "tailwindcss/defaultTheme";

const colors = {
  white: "#fff",
  gray: {
    "extra-light": "#e0e0e0",
    light: "#4d4d4d",
    DEFAULT: "#8C8C8C",
    dark: {
      DEFAULT: "#1a1a1a",
      hovered: "#262626",
    },
  },
  muted: "#8c8c8c",

  accent: "#f5f5f5",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
      },
      transitionProperty: {
        "colors-shadow":
          "color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow",
      },
    },
    colors,
    boxShadow: {
      lg: "0px 0.5rem 1rem",
      xl: "0px 1rem 32rem",
      sm: "0px 0.25rem 1rem",
    },
    boxShadowColor: {
      ...colors,
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Inter", "sans-serif"],
      "edu-sa": ["Edu SA Beginner", "cursive"],
      mono: ["Roboto Mono", "monospace"],
    },
    colors: {
      white: "#fff",
      black: "#000",
      transparent: "#ffffff00",

      // ✅ richblack — CodeHelp jaisa dark background (thoda warm dark)
      richblack: {
        5:  "#F5F5F5",
        25: "#E0E0E0",
        50: "#BDBDBD",
        100: "#9E9E9E",
        200: "#757575",
        300: "#616161",
        400: "#4A4A4A",
        500: "#3A3A3A",
        600: "#2C2C2C",
        700: "#1F1F1F",  // card background
        800: "#141414",  // page background
        900: "#0A0A0A",  // deepest dark
      },

      // ✅ richblue — same rakho (forms mein use hota hai)
      richblue: {
        5:  "#ECF5FF",
        25: "#C6D6E1",
        50: "#A0B7C3",
        100: "#7A98A6",
        200: "#537988",
        300: "#2D5A6A",
        400: "#073B4C",
        500: "#063544",
        600: "#042E3B",
        700: "#032833",
        800: "#01212A",
        900: "#001B22",
      },

      // ✅ blue — same rakho
      blue: {
        5:  "#EAF5FF",
        25: "#B4DAEC",
        50: "#7EC0D9",
        100: "#47A5C5",
        200: "#118AB2",
        300: "#0F7A9D",
        400: "#0C6A87",
        500: "#0A5A72",
        600: "#074B5D",
        700: "#053B48",
        800: "#022B32",
        900: "#001B1D",
      },

      // ✅ caribbeangreen — CodeHelp ka green accent (success states)
      caribbeangreen: {
        5:  "#E8F5E9",
        25: "#C8E6C9",
        50: "#A5D6A7",
        100: "#81C784",
        200: "#66BB6A",
        300: "#4CAF50",
        400: "#43A047",
        500: "#388E3C",
        600: "#2E7D32",
        700: "#1B5E20",
        800: "#0A3D12",
        900: "#011F06",
      },

      // ✅ brown — same rakho
      brown: {
        5:  "#FFF4C4",
        25: "#FFE395",
        50: "#FFD166",
        100: "#E7BC5B",
        200: "#CFA64F",
        300: "#B89144",
        400: "#A07C39",
        500: "#88662D",
        600: "#705122",
        700: "#593C17",
        800: "#41260B",
        900: "#291100",
      },

      // ✅ pink — CodeHelp ka red/orange error & highlight color
      pink: {
        5:  "#FFF3EE",
        25: "#FFD4BC",
        50: "#FFB499",
        100: "#FF8C66",
        200: "#FF6B35",  // CodeHelp main orange
        300: "#E55A25",
        400: "#CC4A15",
        500: "#B23A05",
        600: "#992B00",
        700: "#7A2000",
        800: "#5C1500",
        900: "#3D0A00",
      },

      // ✅ yellow — CodeHelp ka orange/amber accent (primary CTA color)
      yellow: {
        5:  "#FFF8F0",
        25: "#FFE0B2",
        50: "#FFCC80",
        100: "#FFB74D",
        200: "#FFA726",  // main accent — CodeHelp orange buttons
        300: "#FF9800",  // primary orange
        400: "#FB8C00",
        500: "#F57C00",
        600: "#E65100",  // deep orange
        700: "#BF360C",
        800: "#8C1F00",
        900: "#5C0A00",
      },

      // ✅ pure-greys — same rakho
      "pure-greys": {
        5:  "#F9F9F9",
        25: "#E2E2E2",
        50: "#CCCCCC",
        100: "#B5B5B5",
        200: "#9E9E9E",
        300: "#888888",
        400: "#717171",
        500: "#5B5B5B",
        600: "#444444",
        700: "#2D2D2D",
        800: "#171717",
        900: "#141414",
      },
    },
    extend: {
      maxWidth: {
        maxContent: "1260px",
        maxContentTab: "650px",
      },
      animation: {
    shimmer: "shimmer 2.5s ease infinite",
    sweep: "sweep 3s ease infinite",
  },
  keyframes: {
    shimmer: {
      "0%":        { backgroundPosition: "0% 50%" },
      "50%":       { backgroundPosition: "100% 50%" },
      "100%":      { backgroundPosition: "0% 50%" },
    },
    sweep: {
      "0%":        { left: "-75%" },
      "60%, 100%": { left: "125%" },
    },
  },
    },
  },
  plugins: [],
};
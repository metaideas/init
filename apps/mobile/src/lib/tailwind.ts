import { create } from "twrnc"

const tw = create({
  theme: {
    extend: {
      colors: {
        border: "#E8ECF0",
        input: "#E8ECF0",
        ring: "#A6B5C5",
        background: "#FFFFFF",
        foreground: "#1C2A3A",
        primary: {
          DEFAULT: "#1C2A3A",
          foreground: "#F8FAFC",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#1C2A3A",
        },
        destructive: {
          DEFAULT: "#FF0000",
          foreground: "#F8FAFC",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#768497",
        },
        accent: {
          DEFAULT: "#F1F5F9",
          foreground: "#1C2A3A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C2A3A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C2A3A",
        },
      },
    },
  },
})

export const style = tw.style

export default tw

import { StyleSheet } from "react-native-unistyles"

const baseTheme = {
  sizing: {
    "0": 0,
    px: 1,
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64,
    // etc...
  },
  spacing: {
    "0": 0,
    px: 1,
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "7": 28,
    "8": 32,
    "9": 36,
    "10": 40,
    "12": 48,
    "16": 64,
    // etc...
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 40,
    "4xl": 48,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
    },
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      base: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },
  utils: {
    createElevationShadow: (elevation: number) => ({
      shadowOffset: {
        width: 0,
        height: elevation * 0.5,
      },
      shadowOpacity: elevation * 0.05,
      shadowRadius: elevation * 1.2,
      elevation, // Android
    }),
    // Function for consistent spacing scales
    getScaledSpacing: (baseValue: number, scale: number) => baseValue * scale,
    // Function to get consistent alpha values for colors
    withOpacity: (opacity: number) =>
      `${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
  },
}

const lightTheme = {
  ...baseTheme,
  colors: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8E8E93",
    textMuted: "#C7C7CC",
    danger: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  },
} as const

const darkTheme = {
  ...baseTheme,
  colors: {
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    background: "#000000",
    card: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    textMuted: "#48484A",
    danger: "#FF453A",
    success: "#30D158",
    warning: "#FF9F0A",
  },
} as const

// you can also add as many themes as you need to
const themes = {
  light: lightTheme,
  dark: darkTheme,
}

// you can also add custom width breakpoints just like the web!
// If your app will be used on tablets, phones and screens with
// different sizes, this will help you to create
// a more responsive app.
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  "2xl": 2000,
  "3xl": 4000,
} as const

// you can easily get the types to create components
// with variants just like shadcn/ui
type AppBreakpoints = typeof breakpoints
type AppThemes = typeof themes

declare module "react-native-unistyles" {
  interface UnistylesThemes extends AppThemes {}
  interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    initialTheme: "light",
  },
  breakpoints,
  themes,
})

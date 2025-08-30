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
    "20": 80,
    "24": 96,
    "28": 112,
    "32": 128,
    "36": 144,
    "40": 160,
    "48": 192,
  } as const,
  spacing: {
    "0": 0,
    px: 1,
    "1": 4,
    "2": 8,
    "2.5": 10,
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
    "20": 80,
    "24": 96,
    "28": 112,
    "32": 128,
    "36": 144,
    "40": 160,
    "48": 192,
  } as const,

  borderRadius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    "3xl": 24,
    "4xl": 32,
    full: 9999,
  } as const,

  typography: {
    fontSize: {
      xs: 12, // 0.75rem
      sm: 14, // 0.875rem
      base: 16, // 1rem
      lg: 18, // 1.125rem
      xl: 20, // 1.25rem
      "2xl": 24, // 1.5rem
      "3xl": 30, // 1.875rem
      "4xl": 36, // 2.25rem
      "5xl": 48, // 3rem
      "6xl": 60, // 3.75rem
      "7xl": 72, // 4.5rem
      "8xl": 96, // 6rem
      "9xl": 128, // 8rem
    } as const,

    lineHeight: {
      xs: 16, // calc(1 / 0.75) = 1.333... * 12 = 16
      sm: 20, // calc(1.25 / 0.875) = 1.428... * 14 = 20
      base: 24, // calc(1.5 / 1) = 1.5 * 16 = 24
      lg: 28, // calc(1.75 / 1.125) = 1.555... * 18 = 28
      xl: 28, // calc(1.75 / 1.25) = 1.4 * 20 = 28
      "2xl": 32, // calc(2 / 1.5) = 1.333... * 24 = 32
      "3xl": 36, // calc(2.25 / 1.875) = 1.2 * 30 = 36
      "4xl": 40, // calc(2.5 / 2.25) = 1.111... * 36 = 40
      "5xl": 48, // 1 * 48 = 48
      "6xl": 60, // 1 * 60 = 60
      "7xl": 72, // 1 * 72 = 72
      "8xl": 96, // 1 * 96 = 96
      "9xl": 128, // 1 * 128 = 128
    } as const,

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
    } as const,
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
    hexToRgba: (hex: string, alpha: number) => {
      const normalized = hex.replace("#", "")
      const r = Number.parseInt(normalized.slice(0, 2), 16)
      const g = Number.parseInt(normalized.slice(2, 4), 16)
      const b = Number.parseInt(normalized.slice(4, 6), 16)
      return `rgba(${r},${g},${b},${alpha})`
    },
  },
}

type Colors = {
  background: string
  black: string
  card: string
  destructive: string
  foreground: string
  grey: string
  grey2: string
  grey3: string
  grey4: string
  grey5: string
  grey6: string
  primary: string
  root: string
  white: string
}

const lightTheme = {
  ...baseTheme,
  colors: {
    background: "#f5f7f9",
    black: "#000000",
    card: "#f5f7f9",
    destructive: "#ff382b",
    foreground: "#030405",
    grey: "#9da1a6",
    grey2: "#b2b6ba",
    grey3: "#d2d4d7",
    grey4: "#e2e4e5",
    grey5: "#edeeef",
    grey6: "#f8f8f9",
    primary: "#007bff",
    root: "#f5f7f9",
    white: "#ffffff",
  } as const satisfies Colors,
} as const

const darkTheme = {
  ...baseTheme,
  colors: {
    background: "#000204",
    black: "#000000",
    card: "#000204",
    destructive: "#FE4336",
    foreground: "#F7FBFF",
    grey: "#9BA0A5",
    grey2: "#737980",
    grey3: "#4A4E52",
    grey4: "#373A3D",
    grey5: "#2B2D2F",
    grey6: "#1A1B1C",
    primary: "#007BFF",
    root: "#000204",
    white: "#ffffff",
  } as const satisfies Colors,
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

export const spacing = {
  "0": 0,
  "0.5": 2,
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
  px: 1,
} as const

export const borderRadius = {
  "2xl": 16,
  "3xl": 24,
  "4xl": 32,
  full: 9999,
  lg: 8,
  md: 6,
  sm: 4,
  xl: 12,
  xs: 2,
} as const

export const typography = {
  fontSize: {
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
    "7xl": 72,
    "8xl": 96,
    "9xl": 128,
    base: 16,
    lg: 18,
    sm: 14,
    xl: 20,
    xs: 12,
  } as const,

  lineHeight: {
    "2xl": 32,
    "3xl": 36,
    "4xl": 40,
    "5xl": 48,
    "6xl": 60,
    "7xl": 72,
    "8xl": 96,
    "9xl": 128,
    base: 24,
    lg: 28,
    relaxed: 1.5,
    sm: 20,
    snug: 1.3,
    tight: 1.15,
    xl: 28,
    xs: 16,
  } as const,

  fontWeight: {
    base: "400",
    black: "900",
    bold: "700",
    extrabold: "800",
    extralight: "200",
    light: "300",
    medium: "500",
    semibold: "600",
    thin: "100",
  } as const,
} as const

/**
 * You can also add custom width breakpoints just like the web! If your app will
 * be used on tablets, phones, and screens with different sizes, this will help
 * you to create a more responsive app.
 */
export const breakpoints = {
  "2xl": 2000,
  "3xl": 4000,
  lg: 992,
  md: 768,
  sm: 576,
  xl: 1200,
  xs: 0,
} as const

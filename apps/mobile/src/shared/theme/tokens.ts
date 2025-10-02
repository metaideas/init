export const spacing = {
  "0": 0,
  px: 1,
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
} as const

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  "4xl": 32,
  full: 9999,
} as const

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
    "7xl": 72,
    "8xl": 96,
    "9xl": 128,
  } as const,

  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    "2xl": 32,
    "3xl": 36,
    "4xl": 40,
    "5xl": 48,
    "6xl": 60,
    "7xl": 72,
    "8xl": 96,
    "9xl": 128,

    tight: 1.15,
    snug: 1.3,
    relaxed: 1.5,
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
} as const

/**
 * You can also add custom width breakpoints just like the web! If your app will
 * be used on tablets, phones, and screens with different sizes, this will help
 * you to create a more responsive app.
 */
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  "2xl": 2000,
  "3xl": 4000,
} as const

type Theme = "light" | "dark"

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

export const colors = {
  light: {
    background: "#f5f7f9",
    black: "#000000",
    card: "#f5f7f9",
    destructive: "#ff382b",
    foreground: "#030405",
    grey: "#9BA0A5",
    grey2: "#737980",
    grey3: "#4A4E52",
    grey4: "#373A3D",
    grey5: "#2B2D2F",
    grey6: "#1A1B1C",
    primary: "#007bff",
    root: "#f5f7f9",
    white: "#ffffff",
  },
  dark: {
    background: "#000204",
    black: "#000000",
    card: "#000204",
    destructive: "#FE4336",
    foreground: "#F7FBFF",
    grey: "#9da1a6",
    grey2: "#b2b6ba",
    grey3: "#d2d4d7",
    grey4: "#e2e4e5",
    grey5: "#edeeef",
    grey6: "#f8f8f9",
    primary: "#007BFF",
    root: "#000204",
    white: "#ffffff",
  },
} satisfies Record<Theme, Colors>

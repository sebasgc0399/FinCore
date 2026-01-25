import { createContext } from "react"

export type Theme = "light" | "dark"

export type ThemeMode = "system" | "manual"

export type ThemeContextValue = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  theme: Theme
  toggleTheme: () => void
  effectiveTheme: Theme
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

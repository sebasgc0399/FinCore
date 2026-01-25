import { createContext, useCallback, useEffect, useMemo, useState } from "react"

import type { ReactNode } from "react"

import { useMediaQuery } from "@/hooks/useMediaQuery"

type Theme = "light" | "dark"

type ThemeMode = "system" | "manual"

type ThemeContextValue = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  theme: Theme
  toggleTheme: () => void
  effectiveTheme: Theme
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = {
  children: ReactNode
}

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedMode = localStorage.getItem("fincore_theme_mode")
  if (storedMode === "system" || storedMode === "manual") {
    return storedMode
  }

  return "system"
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light"
  }

  const storedTheme = localStorage.getItem("fincore_theme")
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
  const systemTheme: Theme = prefersDark ? "dark" : "light"
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const effectiveTheme = themeMode === "system" ? systemTheme : theme

  const toggleTheme = useCallback(() => {
    setThemeMode("manual")
    setTheme((current) => {
      const baseTheme = themeMode === "system" ? effectiveTheme : current
      return baseTheme === "dark" ? "light" : "dark"
    })
  }, [effectiveTheme, themeMode])

  useEffect(() => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let timeoutId: number | undefined

    if (!reduceMotion) {
      root.classList.add("theme-transition")
      timeoutId = window.setTimeout(() => {
        root.classList.remove("theme-transition")
      }, 300)
    }

    root.classList.toggle("dark", effectiveTheme === "dark")
    root.style.colorScheme = effectiveTheme

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      root.classList.remove("theme-transition")
    }
  }, [effectiveTheme])

  useEffect(() => {
    localStorage.setItem("fincore_theme_mode", themeMode)
  }, [themeMode])

  useEffect(() => {
    if (themeMode === "manual") {
      localStorage.setItem("fincore_theme", theme)
    }
  }, [themeMode, theme])

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      theme,
      toggleTheme,
      effectiveTheme,
    }),
    [themeMode, theme, toggleTheme, effectiveTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

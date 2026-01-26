import { useCallback, useEffect, useMemo, useState } from "react"

import type { ReactNode } from "react"

import { ThemeContext, type Theme, type ThemeMode } from "@/app/theme-context"
import { useMediaQuery } from "@/hooks/useMediaQuery"

type ThemeProviderProps = {
  children: ReactNode
}

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light"
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
  const systemTheme: Theme = prefersDark ? "dark" : "light"
  const [themeMode, setThemeMode] = useState<ThemeMode>("system")
  const [theme, setTheme] = useState<Theme>(getSystemTheme)

  const effectiveTheme = themeMode === "manual" ? theme : systemTheme

  const toggleTheme = useCallback(() => {
    const baseTheme = themeMode === "manual" ? theme : systemTheme
    const nextTheme = baseTheme === "dark" ? "light" : "dark"
    setThemeMode("manual")
    setTheme(nextTheme)
  }, [setThemeMode, systemTheme, themeMode, theme])

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

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      theme,
      setTheme,
      toggleTheme,
      effectiveTheme,
    }),
    [themeMode, setThemeMode, theme, setTheme, toggleTheme, effectiveTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

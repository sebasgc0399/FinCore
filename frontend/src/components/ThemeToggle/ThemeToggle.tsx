import { useTranslation } from "react-i18next"

import type { Theme } from "@/app/theme-context"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

import "./ThemeToggle.css"

type ThemeToggleProps = {
  onToggle?: (theme: Theme) => void
}

export const ThemeToggle = ({ onToggle }: ThemeToggleProps) => {
  // Credit: Pixel Art Theme Switcher by Jamie Wilson.
  const { t } = useTranslation("settings")
  const { themeMode, toggleTheme, effectiveTheme } = useTheme()
  const isDark = effectiveTheme === "dark"
  const isDisabled = themeMode === "system"

  const ariaLabel = isDark
    ? t("account.appearance.toggleAriaOn")
    : t("account.appearance.toggleAriaOff")

  const handleToggle = () => {
    if (isDisabled) {
      return
    }

    const nextTheme: Theme = isDark ? "light" : "dark"
    toggleTheme()
    onToggle?.(nextTheme)
  }

  return (
    <div className="fincore-theme-toggle theme-toggle-wrapper">
      <button
        aria-label={ariaLabel}
        aria-pressed={isDark}
        className={cn(
          "theme-switcher-grid",
          isDark && "night-theme",
          isDisabled && "theme-switcher-disabled"
        )}
        disabled={isDisabled}
        onClick={handleToggle}
        type="button"
      >
        <div className="sun" aria-hidden="true" />
        <div className="moon-overlay" aria-hidden="true" />
        <div className="cloud-ball cloud-ball-left" id="ball1" aria-hidden="true" />
        <div className="cloud-ball cloud-ball-middle" id="ball2" aria-hidden="true" />
        <div className="cloud-ball cloud-ball-right" id="ball3" aria-hidden="true" />
        <div className="cloud-ball cloud-ball-top" id="ball4" aria-hidden="true" />
        <div className="star" id="star1" aria-hidden="true" />
        <div className="star" id="star2" aria-hidden="true" />
        <div className="star" id="star3" aria-hidden="true" />
        <div className="star" id="star4" aria-hidden="true" />
      </button>
    </div>
  )
}

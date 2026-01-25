import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

import "./ThemeToggle.css"

export const ThemeToggle = () => {
  // Credit: Pixel Art Theme Switcher by Jamie Wilson.
  const { t } = useTranslation("settings")
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  const ariaLabel = isDark
    ? t("account.appearance.toggleAriaOn")
    : t("account.appearance.toggleAriaOff")

  return (
    <div className="fincore-theme-toggle theme-toggle-wrapper">
      <button
        aria-label={ariaLabel}
        aria-pressed={isDark}
        className={cn("theme-switcher-grid", isDark && "night-theme")}
        onClick={toggleTheme}
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

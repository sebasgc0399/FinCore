import { type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"

export const SettingsPage = () => {
  const { t, i18n } = useTranslation("common")
  const currentLanguage = i18n.language?.startsWith("en") ? "en" : "es"

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextLanguage = event.target.value === "en" ? "en" : "es"
    localStorage.setItem("fincore_lang", nextLanguage)
    void i18n.changeLanguage(nextLanguage)
  }

  return (
    <section className="px-4">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h2 className="text-lg font-semibold">{t("settings.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("underConstruction")}</p>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="language-select">
            {t("settings.languageLabel")}
          </label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="language-select"
            onChange={handleLanguageChange}
            value={currentLanguage}
            aria-label={t("settings.languageSelect")}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </section>
  )
}

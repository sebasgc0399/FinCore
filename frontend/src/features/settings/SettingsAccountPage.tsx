import { type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export const SettingsAccountPage = () => {
  const { t, i18n } = useTranslation(["settings", "common"])
  const currentLanguage = i18n.language?.startsWith("en") ? "en" : "es"

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextLanguage = event.target.value === "en" ? "en" : "es"
    localStorage.setItem("fincore_lang", nextLanguage)
    void i18n.changeLanguage(nextLanguage)
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">
            {t("settings:account.appearance.title")}
          </CardTitle>
          <CardDescription>
            {t("settings:account.appearance.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("common:underConstruction")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">
            {t("settings:account.language.title")}
          </CardTitle>
          <CardDescription>
            {t("settings:account.language.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="settings-language-select">
              {t("settings:account.language.label")}
            </Label>
            <select
              id="settings-language-select"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={handleLanguageChange}
              value={currentLanguage}
              aria-label={t("settings:account.language.select")}
            >
              <option value="es">
                {t("settings:account.language.options.es")}
              </option>
              <option value="en">
                {t("settings:account.language.options.en")}
              </option>
            </select>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

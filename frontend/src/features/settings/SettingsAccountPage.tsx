import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle"
import { SelectSheet } from "@/components/common/SelectSheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/hooks/useTheme"

export const SettingsAccountPage = () => {
  const { t, i18n } = useTranslation("settings")
  const { themeMode, setThemeMode } = useTheme()
  const currentLanguage = i18n.language?.startsWith("en") ? "en" : "es"
  const isSystemMode = themeMode === "system"
  const systemSwitchId = "system-theme-switch"
  const systemHintId = "system-theme-hint"

  const handleLanguageChange = (nextLanguage: string): void => {
    const languageValue = nextLanguage === "en" ? "en" : "es"
    localStorage.setItem("fincore_lang", languageValue)
    void i18n.changeLanguage(languageValue)
  }

  const handleSystemThemeChange = (checked: boolean): void => {
    setThemeMode(checked ? "system" : "manual")
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
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {t("settings:account.appearance.toggleLabel")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("settings:account.appearance.toggleHint")}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium" htmlFor={systemSwitchId}>
                    {t("settings:account.appearance.systemLabel")}
                  </Label>
                  <p
                    className="text-xs text-muted-foreground"
                    id={systemHintId}
                  >
                    {t("settings:account.appearance.systemHint")}
                  </p>
                </div>
                <Switch
                  aria-describedby={systemHintId}
                  checked={isSystemMode}
                  id={systemSwitchId}
                  onCheckedChange={handleSystemThemeChange}
                />
              </div>
            </div>
          </div>
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
          <SelectSheet
            label={t("settings:account.language.label")}
            title={t("settings:account.language.selectTitle")}
            description={t("settings:account.language.selectDescription")}
            value={currentLanguage}
            options={[
              {
                value: "es",
                label: t("settings:account.language.options.es"),
              },
              {
                value: "en",
                label: t("settings:account.language.options.en"),
              },
            ]}
            onChange={handleLanguageChange}
            placeholder={t("settings:account.language.placeholder")}
            emptyLabel={t("settings:account.language.empty")}
            contentClassName="max-h-[60vh]"
          />
        </CardContent>
      </Card>
    </section>
  )
}

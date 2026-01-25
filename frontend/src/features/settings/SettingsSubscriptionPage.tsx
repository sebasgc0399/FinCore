import { useTranslation } from "react-i18next"

export const SettingsSubscriptionPage = () => {
  const { t } = useTranslation(["settings", "common"])

  return (
    <section className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t("settings:subscription.description")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("common:underConstruction")}
      </p>
    </section>
  )
}

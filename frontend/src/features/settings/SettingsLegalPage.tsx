import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export const SettingsLegalPage = () => {
  const { t } = useTranslation("settings")

  return (
    <section className="space-y-2">
      <Button asChild className="w-full justify-start" variant="outline">
        <Link to="/terms">{t("legal.terms")}</Link>
      </Button>
      <Button asChild className="w-full justify-start" variant="outline">
        <Link to="/privacy">{t("legal.privacy")}</Link>
      </Button>
    </section>
  )
}

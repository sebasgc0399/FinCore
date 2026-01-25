import type { LucideIcon } from "lucide-react"
import { CreditCard, FileText, LifeBuoy, Shield, User } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SettingsSectionCard } from "@/features/settings/SettingsSectionCard"
import { useIsAdmin } from "@/features/settings/hooks/useIsAdmin"

type SettingsSection = {
  to: string
  title: string
  description: string
  Icon: LucideIcon
}

export const SettingsHomePage = () => {
  const { t } = useTranslation("settings")
  const { isAdmin, loading } = useIsAdmin()

  const sections: SettingsSection[] = [
    {
      to: "/settings/account",
      title: t("home.sections.account.title"),
      description: t("home.sections.account.description"),
      Icon: User,
    },
    {
      to: "/settings/subscription",
      title: t("home.sections.subscription.title"),
      description: t("home.sections.subscription.description"),
      Icon: CreditCard,
    },
    {
      to: "/settings/support",
      title: t("home.sections.support.title"),
      description: t("home.sections.support.description"),
      Icon: LifeBuoy,
    },
    {
      to: "/settings/legal",
      title: t("home.sections.legal.title"),
      description: t("home.sections.legal.description"),
      Icon: FileText,
    },
  ]
  const adminSection: SettingsSection = {
    to: "/settings/admin",
    title: t("home.sections.admin.title"),
    description: t("home.sections.admin.description"),
    Icon: Shield,
  }
  const visibleSections =
    isAdmin && !loading ? [...sections, adminSection] : sections

  return (
    <section className="space-y-3">
      {visibleSections.map((section) => (
        <SettingsSectionCard key={section.to} {...section} />
      ))}
    </section>
  )
}

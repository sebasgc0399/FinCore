import { i18n } from "@/lib/i18n"

export const formatCurrency = (
  amount: number,
  currency: string,
  locale?: string
): string => {
  const resolvedLocale = locale ?? i18n.language ?? "es"
  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency,
  }).format(amount)
}

export const formatDate = (
  date: Date | number | string,
  locale?: string
): string => {
  const resolvedLocale = locale ?? i18n.language ?? "es"
  const value = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(resolvedLocale).format(value)
}

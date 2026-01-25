import type { TFunction } from "i18next"

import type { SystemCategory, UserCategory } from "@/types/db-schema"

type Category = SystemCategory | UserCategory

export const resolveCategoryLabel = (
  category: Category,
  t: TFunction
): string => {
  if ("labelKey" in category && category.labelKey) {
    if (category.labelKey.includes(":")) {
      return t(category.labelKey)
    }

    return t(category.labelKey, {
      ns: "common",
      defaultValue: category.labelKey,
    })
  }

  if ("label" in category) {
    return category.label ?? ""
  }

  return ""
}

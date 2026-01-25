import type { TFunction } from "i18next"

import type { SystemCategory, UserCategory } from "@/types/db-schema"

type Category = SystemCategory | UserCategory

export const resolveCategoryLabel = (
  category: Category,
  t: TFunction
): string => {
  if ("labelKey" in category && category.labelKey) {
    return t(category.labelKey)
  }

  return category.label ?? ("labelKey" in category ? category.labelKey : "") ?? ""
}

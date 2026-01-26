import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { resolveCategoryLabel } from "@/lib/resolve-category-label"

import { Button } from "@/components/ui/button"

import type { SystemCategory } from "@/types/db-schema"

type SystemCategoryListItemProps = {
  category: SystemCategory
  index: number
  total: number
  parentLabel: string | null
  isReordering: boolean
  onEdit: (category: SystemCategory) => void
  onDelete: (category: SystemCategory) => void
  onReorder: (categoryId: string, direction: "up" | "down") => void
}

export const SystemCategoryListItem = ({
  category,
  index,
  total,
  parentLabel,
  isReordering,
  onEdit,
  onDelete,
  onReorder,
}: SystemCategoryListItemProps) => {
  const { t } = useTranslation(["settings", "common"])

  return (
    <li className="space-y-3 rounded-lg border border-border/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {resolveCategoryLabel(category, t)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("settings:admin.systemCategories.meta.labelKey", {
              value: category.labelKey,
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="h-11 px-3"
            type="button"
            variant="outline"
            onClick={() => onEdit(category)}
          >
            <Pencil className="h-4 w-4" />
            {t("settings:admin.systemCategories.actions.edit")}
          </Button>
          <Button
            className="h-11 px-3"
            type="button"
            variant="destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-4 w-4" />
            {t("settings:admin.systemCategories.actions.delete")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          {t("settings:admin.systemCategories.meta.id", {
            value: category.id,
          })}
        </span>
        <span>
          {t("settings:admin.systemCategories.meta.icon", {
            value: category.icon,
          })}
        </span>
        <span>
          {t("settings:admin.systemCategories.meta.order", {
            value: String(category.order),
          })}
        </span>
        {category.color ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            {t("settings:admin.systemCategories.meta.color", {
              value: category.color,
            })}
          </span>
        ) : null}
        {parentLabel ? (
          <span>
            {t("settings:admin.systemCategories.meta.parentId", {
              value: parentLabel,
            })}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button
          className="h-11 w-11"
          type="button"
          variant="ghost"
          aria-label={t("settings:admin.actions.moveUp")}
          onClick={() => onReorder(category.id, "up")}
          disabled={index === 0 || isReordering}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          className="h-11 w-11"
          type="button"
          variant="ghost"
          aria-label={t("settings:admin.actions.moveDown")}
          onClick={() => onReorder(category.id, "down")}
          disabled={index === total - 1 || isReordering}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}

import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { resolveCategoryLabel } from "@/lib/resolve-category-label"
import { SystemCategoryListItem } from "@/features/settings/components/SystemCategoryListItem"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { CategoryKind } from "@/features/settings/types/system-category-form"
import type { SystemCategoryEntity } from "@/types/db-schema"

type SystemCategoryListProps = {
  categories: SystemCategoryEntity[]
  activeKind: CategoryKind
  loading: boolean
  loadError: boolean
  actionErrorMessage: string | null
  isReordering: boolean
  onCreate: () => void
  onEdit: (category: SystemCategoryEntity) => void
  onDelete: (category: SystemCategoryEntity) => void
  onReorder: (categoryId: string, direction: "up" | "down") => void
  onKindChange: (kind: CategoryKind) => void
}

export const SystemCategoryList = ({
  categories,
  activeKind,
  loading,
  loadError,
  actionErrorMessage,
  isReordering,
  onCreate,
  onEdit,
  onDelete,
  onReorder,
  onKindChange,
}: SystemCategoryListProps) => {
  const { t } = useTranslation(["settings", "common"])
  const labelMap = new Map(
    categories.map((category) => [category.id, resolveCategoryLabel(category, t)])
  )

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {t("settings:admin.systemCategories.title")}
            </CardTitle>
            <CardDescription>
              {t("settings:admin.systemCategories.description")}
            </CardDescription>
          </div>
          <Button className="h-11" type="button" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            {t("settings:admin.systemCategories.actions.new")}
          </Button>
        </div>

        <div className="space-y-2">
          <div
            className="flex w-full rounded-lg border border-input bg-muted p-1"
            role="tablist"
          >
            {(["expense", "income"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                role="tab"
                aria-selected={activeKind === kind}
                onClick={() => onKindChange(kind)}
                className={`h-11 flex-1 rounded-md px-3 text-sm font-medium transition-colors ${
                  activeKind === kind
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t(`settings:admin.tabs.${kind}`)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings:admin.form.reorderHint")}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError ? (
          <div
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {t("settings:admin.systemCategories.errors.load")}
          </div>
        ) : null}

        {actionErrorMessage ? (
          <div
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {actionErrorMessage}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">
            {t("settings:admin.systemCategories.loading")}
          </p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("settings:admin.systemCategories.empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {categories.map((category, index) => (
              <SystemCategoryListItem
                key={category.id}
                category={category}
                index={index}
                total={categories.length}
                parentLabel={
                  category.parentId
                    ? labelMap.get(category.parentId) ?? category.parentId
                    : null
                }
                isReordering={isReordering}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

import type {
  TransactionCategory,
  TransactionKind,
} from "@/features/expenses/types/transaction"

type TransactionCategoryChipsProps = {
  kind: TransactionKind
  categories: TransactionCategory[]
  recentIds: string[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMore?: () => void
}

export const TransactionCategoryChips = ({
  kind,
  categories,
  recentIds,
  selectedId,
  onSelect,
  onMore,
}: TransactionCategoryChipsProps) => {
  const { t } = useTranslation("common")

  const { recentCategories, remainingCategories } = useMemo(() => {
    const byId = new Map(categories.map((category) => [category.id, category]))
    const recent = recentIds
      .map((id) => byId.get(id))
      .filter(
        (category): category is TransactionCategory =>
          category !== undefined && category.kind === kind
      )
    const recentIdSet = new Set(recent.map((category) => category.id))
    const remaining = categories.filter(
      (category) => category.kind === kind && !recentIdSet.has(category.id)
    )

    return { recentCategories: recent, remainingCategories: remaining }
  }, [categories, kind, recentIds])

  const handleSelect = (id: string): void => {
    if (selectedId === id) {
      onSelect(null)
      return
    }
    onSelect(id)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {t("common:transaction.categoriesLabel")}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...recentCategories, ...remainingCategories].map((category) => {
          const isActive = selectedId === category.id
          const label = t(category.labelKey, {
            ns: "common",
            defaultValue: category.labelKey,
          })

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={isActive}
            >
              {label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={onMore}
          disabled={!onMore}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            onMore
              ? "border-dashed border-border text-muted-foreground hover:text-foreground"
              : "border-dashed border-border/60 text-muted-foreground/60"
          )}
        >
          {t("common:transaction.categoryMore")}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedId
          ? t(
              categories.find((category) => category.id === selectedId)
                ?.labelKey ?? "common:transaction.categoryNone",
              { ns: "common", defaultValue: t("common:transaction.categoryNone") }
            )
          : t("common:transaction.categoryNone")}
      </p>
    </div>
  )
}

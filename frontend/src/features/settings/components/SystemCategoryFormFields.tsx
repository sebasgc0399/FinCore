import { useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { resolveCategoryLabel } from "@/lib/resolve-category-label"
import { IconPicker } from "@/features/settings/components/IconPicker"

import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { CategoryDraft } from "@/features/settings/types/system-category-form"
import type { SystemCategory } from "@/types/db-schema"

type SystemCategoryFormFieldsProps = {
  formId: string
  draft: CategoryDraft
  isEditMode: boolean
  categories: SystemCategory[]
  iconPickerOpen: boolean
  onIconPickerOpenChange: (open: boolean) => void
  onDraftChange: (updates: Partial<CategoryDraft>) => void
}

export const SystemCategoryFormFields = ({
  formId,
  draft,
  isEditMode,
  categories,
  iconPickerOpen,
  onIconPickerOpenChange,
  onDraftChange,
}: SystemCategoryFormFieldsProps) => {
  const { t } = useTranslation(["settings", "common"])
  const [iconMap, setIconMap] = useState<Record<string, LucideIcon> | null>(
    null
  )

  const parentOptions = useMemo(() => {
    return categories
      .filter(
        (category) => category.kind === draft.kind && category.id !== draft.id
      )
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        value: category.id,
        label: resolveCategoryLabel(category, t),
      }))
  }, [categories, draft.id, draft.kind, t])

  useEffect(() => {
    if (!draft.icon || iconMap) {
      return
    }

    let isMounted = true

    void import("lucide-react")
      .then((module) => {
        if (!isMounted) {
          return
        }

        const icons = (module as { icons?: Record<string, LucideIcon> }).icons ?? {}
        setIconMap(icons)
      })
      .catch(() => {
        if (isMounted) {
          setIconMap({})
        }
      })

    return () => {
      isMounted = false
    }
  }, [draft.icon, iconMap])

  const SelectedIcon = iconMap?.[draft.icon]

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-id`}>
          {t("settings:admin.systemCategories.form.idLabel")}
        </Label>
        <Input
          id={`${formId}-id`}
          onChange={(event) => onDraftChange({ id: event.target.value })}
          placeholder={t("settings:admin.systemCategories.form.idPlaceholder")}
          value={draft.id}
          className="h-11"
          disabled={isEditMode}
          readOnly={isEditMode}
        />
        <p className="text-xs text-muted-foreground">
          {t("settings:admin.systemCategories.form.idHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-labelKey`}>
          {t("settings:admin.systemCategories.form.labelKeyLabel")}
        </Label>
        <Input
          id={`${formId}-labelKey`}
          onChange={(event) => onDraftChange({ labelKey: event.target.value })}
          placeholder={t(
            "settings:admin.systemCategories.form.labelKeyPlaceholder"
          )}
          value={draft.labelKey}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-icon`}>
          {t("settings:admin.systemCategories.form.iconLabel")}
        </Label>
        <div className="grid grid-cols-[44px_1fr] items-center gap-2">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-md border border-input bg-muted/40"
            aria-hidden="true"
          >
            {SelectedIcon ? (
              <SelectedIcon className="h-5 w-5 text-foreground" />
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <Button
            className="h-11 w-full"
            id={`${formId}-icon`}
            type="button"
            variant="outline"
            onClick={() => onIconPickerOpenChange(true)}
          >
            {t("settings:admin.form.iconPicker")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-kind`}>
          {t("settings:admin.systemCategories.form.kindLabel")}
        </Label>
        <select
          id={`${formId}-kind`}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) =>
            onDraftChange({
              kind: event.target.value === "income" ? "income" : "expense",
              parentId: "",
            })
          }
          value={draft.kind}
        >
          <option value="expense">
            {t("settings:admin.systemCategories.kind.expense")}
          </option>
          <option value="income">
            {t("settings:admin.systemCategories.kind.income")}
          </option>
        </select>
        <p className="text-xs text-muted-foreground">
          {t("settings:admin.systemCategories.form.kindDescription")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-color`}>
          {t("settings:admin.form.colorLabel")}
        </Label>
        <ColorPicker
          value={draft.color}
          onChange={(color) => onDraftChange({ color })}
          placeholder={t("settings:admin.form.colorPickerPlaceholder")}
          inputPlaceholder={t("settings:admin.form.colorPlaceholder").replace(
            /#/g,
            ""
          )}
          inputId={`${formId}-color`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-parent`}>
          {t("settings:admin.form.parentLabel")}
        </Label>
        <select
          id={`${formId}-parent`}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => onDraftChange({ parentId: event.target.value })}
          value={draft.parentId}
        >
          <option value="">{t("settings:admin.form.parentNone")}</option>
          {parentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {parentOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("settings:admin.form.parentEmpty")}
          </p>
        ) : null}
      </div>

      <IconPicker
        open={iconPickerOpen}
        onOpenChange={onIconPickerOpenChange}
        value={draft.icon}
        onChange={(icon) => onDraftChange({ icon })}
        title={t("settings:admin.form.iconPicker")}
        searchLabel={t("settings:admin.form.iconSearchLabel")}
        searchHint={t("settings:admin.form.iconSearchHint")}
        searchPlaceholder={t("settings:admin.form.iconSearchPlaceholder")}
        emptyLabel={t("settings:admin.form.iconEmpty")}
        loadingLabel={t("settings:admin.form.iconLoading")}
        cancelLabel={t("settings:admin.systemCategories.actions.cancel")}
        loadMoreLabel={t("settings:admin.form.iconLoadMore")}
        resultsLabel={(shown, total) =>
          t("settings:admin.form.iconResults", { shown, total })
        }
      />
    </>
  )
}

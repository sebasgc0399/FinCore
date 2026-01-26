import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { resolveCategoryLabel } from "@/lib/resolve-category-label"
import { IconPicker } from "@/features/settings/components/IconPicker"

import { Button } from "@/components/ui/button"
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

const isValidHexColor = (value: string): boolean =>
  /^#[0-9A-Fa-f]{6}$/.test(value)

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
  const colorValue = isValidHexColor(draft.color) ? draft.color : "#0F172A"

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
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={`${formId}-icon`}
            onChange={(event) => onDraftChange({ icon: event.target.value })}
            placeholder={t("settings:admin.systemCategories.form.iconPlaceholder")}
            value={draft.icon}
            className="h-11"
          />
          <Button
            className="h-11 sm:w-48"
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id={`${formId}-color`}
            onChange={(event) => onDraftChange({ color: event.target.value })}
            placeholder={t("settings:admin.form.colorPlaceholder")}
            value={draft.color}
            className="h-11"
          />
          <input
            aria-label={t("settings:admin.form.colorLabel")}
            className="h-11 w-full cursor-pointer rounded-md border border-input bg-background px-2 sm:w-20"
            onChange={(event) => onDraftChange({ color: event.target.value })}
            type="color"
            value={colorValue}
          />
        </div>
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
        searchPlaceholder={t("settings:admin.form.iconSearchPlaceholder")}
        emptyLabel={t("settings:admin.form.iconEmpty")}
        loadingLabel={t("settings:admin.form.iconLoading")}
        cancelLabel={t("settings:admin.systemCategories.actions.cancel")}
      />
    </>
  )
}

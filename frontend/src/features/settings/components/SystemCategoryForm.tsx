import { type FormEvent, useId, useState } from "react"
import { useTranslation } from "react-i18next"

import { SystemCategoryFormFields } from "@/features/settings/components/SystemCategoryFormFields"

import { ModalShell } from "@/components/common/ModalShell"
import { Button } from "@/components/ui/button"

import type { SystemCategoryPayload } from "@/features/settings/services/system-categories"
import type { CategoryDraft, CategoryKind } from "@/features/settings/types/system-category-form"
import type { SystemCategory } from "@/types/db-schema"

type FormMode = "create" | "edit"

type SystemCategoryFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: FormMode
  initialCategory: SystemCategory | null
  activeKind: CategoryKind
  categories: SystemCategory[]
  isSaving: boolean
  errorMessage: string | null
  onSubmit: (payload: SystemCategoryPayload, mode: FormMode) => void
}

const buildDraft = (
  initialCategory: SystemCategory | null,
  activeKind: CategoryKind
): CategoryDraft => ({
  id: initialCategory?.id ?? "",
  labelKey: initialCategory?.labelKey ?? "",
  icon: initialCategory?.icon ?? "",
  kind: initialCategory?.kind ?? activeKind,
  order: initialCategory?.order ?? null,
  color: initialCategory?.color ?? "",
  parentId: initialCategory?.parentId ?? "",
})

const getNextOrderForKind = (
  categories: SystemCategory[],
  kind: CategoryKind
): number =>
  categories
    .filter((category) => category.kind === kind)
    .reduce((maxOrder, category) => Math.max(maxOrder, category.order), -1) + 1

export const SystemCategoryForm = ({
  open,
  onOpenChange,
  mode,
  initialCategory,
  activeKind,
  categories,
  isSaving,
  errorMessage,
  onSubmit,
}: SystemCategoryFormProps) => {
  const { t } = useTranslation(["settings", "common"])
  const [draft, setDraft] = useState<CategoryDraft>(() =>
    buildDraft(initialCategory, activeKind)
  )
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const formId = useId()
  const isEditMode = mode === "edit"

  const updateDraft = (updates: Partial<CategoryDraft>): void => {
    setDraft((current) => ({ ...current, ...updates }))
  }

  const handleModalOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) {
      setIconPickerOpen(false)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const isKindChange =
      isEditMode && initialCategory && initialCategory.kind !== draft.kind

    const payload: SystemCategoryPayload = {
      id: draft.id.trim(),
      labelKey: draft.labelKey.trim(),
      icon: draft.icon.trim(),
      kind: draft.kind,
      color: draft.color.trim() ? draft.color.trim() : null,
      parentId: draft.parentId.trim() ? draft.parentId.trim() : null,
      ...(draft.order !== null ? { order: draft.order } : {}),
    }

    const nextPayload = isKindChange
      ? { ...payload, order: getNextOrderForKind(categories, draft.kind) }
      : payload

    onSubmit(nextPayload, mode)
  }

  const modalTitle = isEditMode
    ? t("settings:admin.systemCategories.form.editTitle")
    : t("settings:admin.systemCategories.form.createTitle")
  const modalDescription = isEditMode
    ? t("settings:admin.systemCategories.form.editDescription")
    : t("settings:admin.systemCategories.form.createDescription")

  return (
    <>
      <ModalShell
        open={open}
        onOpenChange={handleModalOpenChange}
        title={modalTitle}
        description={modalDescription}
        contentClassName="max-h-[85vh]"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              className="h-11"
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {t("settings:admin.systemCategories.actions.cancel")}
            </Button>
            <Button
              className="h-11"
              form={formId}
              type="submit"
              disabled={isSaving}
            >
              {isEditMode
                ? t("settings:admin.systemCategories.actions.save")
                : t("settings:admin.systemCategories.actions.create")}
            </Button>
          </div>
        }
      >
        <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage ? (
            <div
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <SystemCategoryFormFields
            formId={formId}
            draft={draft}
            isEditMode={isEditMode}
            categories={categories}
            iconPickerOpen={iconPickerOpen}
            onIconPickerOpenChange={setIconPickerOpen}
            onDraftChange={updateDraft}
          />
        </form>
      </ModalShell>
    </>
  )
}

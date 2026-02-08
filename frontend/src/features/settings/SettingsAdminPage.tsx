import { useState } from "react"
import { useTranslation } from "react-i18next"

import { SystemCategoryDeleteModal } from "@/features/settings/components/SystemCategoryDeleteModal"
import { SystemCategoryForm } from "@/features/settings/components/SystemCategoryForm"
import { SystemCategoryList } from "@/features/settings/components/SystemCategoryList"
import { useSystemCategories } from "@/features/settings/hooks/useSystemCategories"
import {
  createSystemCategory,
  deleteSystemCategory,
  updateSystemCategory,
} from "@/features/settings/services/system-categories"

import type { SystemCategoryPayload } from "@/features/settings/services/system-categories"
import type { CategoryKind } from "@/features/settings/types/system-category-form"
import type { SystemCategoryEntity } from "@/types/db-schema"

type FormMode = "create" | "edit"

type FormErrorKey = "validation" | "invalidOrder" | "save" | null

type ActionErrorKey = "delete" | "reorder" | null

export const SettingsAdminPage = () => {
  const { t } = useTranslation(["settings", "common"])
  const [actionError, setActionError] = useState<ActionErrorKey>(null)
  const [formError, setFormError] = useState<FormErrorKey>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [formSeed, setFormSeed] = useState(0)
  const [editingCategory, setEditingCategory] =
    useState<SystemCategoryEntity | null>(null)
  const [activeKind, setActiveKind] = useState<CategoryKind>("expense")
  const [isSaving, setIsSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<SystemCategoryEntity | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const {
    sortedCategories,
    filteredCategories,
    loading,
    loadError,
    isReordering,
    reorder,
  } = useSystemCategories(activeKind)

  const formErrorMessage = formError
    ? t(`settings:admin.systemCategories.errors.${formError}`)
    : null
  const actionErrorMessage = actionError
    ? t(`settings:admin.systemCategories.errors.${actionError}`)
    : null

  const handleFormOpenChange = (nextOpen: boolean): void => {
    setFormOpen(nextOpen)
    if (!nextOpen) {
      setFormError(null)
    }
  }

  const openCreateForm = (): void => {
    setFormMode("create")
    setEditingCategory(null)
    setFormError(null)
    setFormSeed((current) => current + 1)
    setFormOpen(true)
  }

  const openEditForm = (category: SystemCategoryEntity): void => {
    setFormMode("edit")
    setEditingCategory(category)
    setFormError(null)
    setFormSeed((current) => current + 1)
    setFormOpen(true)
  }

  const validatePayload = (
    payload: SystemCategoryPayload,
    mode: FormMode
  ): FormErrorKey => {
    if (
      payload.id.trim() === "" ||
      payload.labelKey.trim() === "" ||
      payload.icon.trim() === ""
    ) {
      return "validation"
    }

    if (
      mode === "edit" &&
      (typeof payload.order !== "number" ||
        !Number.isInteger(payload.order) ||
        payload.order < 0)
    ) {
      return "invalidOrder"
    }

    return null
  }

  const handleFormSubmit = async (
    payload: SystemCategoryPayload,
    mode: FormMode
  ): Promise<void> => {
    const errorKey = validatePayload(payload, mode)
    if (errorKey) {
      setFormError(errorKey)
      return
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (mode === "create") {
        await createSystemCategory(payload)
      } else {
        await updateSystemCategory(payload)
      }
      setFormOpen(false)
    } catch {
      setFormError("save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorder = async (
    categoryId: string,
    direction: "up" | "down"
  ): Promise<void> => {
    setActionError(null)
    const ok = await reorder(categoryId, direction)
    if (!ok) {
      setActionError("reorder")
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return
    }

    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteSystemCategory(pendingDelete.id)
      setPendingDelete(null)
    } catch {
      setActionError("delete")
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = (): void => {
    setPendingDelete(null)
  }

  return (
    <section className="space-y-4">
      <SystemCategoryList
        categories={filteredCategories}
        activeKind={activeKind}
        loading={loading}
        loadError={loadError}
        actionErrorMessage={actionErrorMessage}
        isReordering={isReordering}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onDelete={setPendingDelete}
        onReorder={handleReorder}
        onKindChange={setActiveKind}
      />

      <SystemCategoryForm
        key={formSeed}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        mode={formMode}
        initialCategory={editingCategory}
        activeKind={activeKind}
        categories={sortedCategories}
        isSaving={isSaving}
        errorMessage={formErrorMessage}
        onSubmit={handleFormSubmit}
      />

      <SystemCategoryDeleteModal
        category={pendingDelete}
        open={Boolean(pendingDelete)}
        isDeleting={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}

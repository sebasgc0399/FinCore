import { useTranslation } from "react-i18next"

import { resolveCategoryLabel } from "@/lib/resolve-category-label"

import { ModalShell } from "@/components/common/ModalShell"
import { Button } from "@/components/ui/button"

import type { SystemCategoryEntity } from "@/types/db-schema"

type SystemCategoryDeleteModalProps = {
  category: SystemCategoryEntity | null
  open: boolean
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const SystemCategoryDeleteModal = ({
  category,
  open,
  isDeleting,
  onClose,
  onConfirm,
}: SystemCategoryDeleteModalProps) => {
  const { t } = useTranslation(["settings", "common"])
  const categoryName = category ? resolveCategoryLabel(category, t) : ""

  return (
    <ModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      title={t("settings:admin.confirmDelete.title")}
      description={t("settings:admin.confirmDelete.description", {
        name: categoryName,
      })}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            className="h-11"
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {t("settings:admin.systemCategories.actions.cancel")}
          </Button>
          <Button
            className="h-11"
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {t("settings:admin.confirmDelete.confirm")}
          </Button>
        </div>
      }
    >
      {category ? (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            {t("settings:admin.systemCategories.meta.id", {
              value: category.id,
            })}
          </p>
          <p>
            {t("settings:admin.systemCategories.meta.labelKey", {
              value: category.labelKey,
            })}
          </p>
        </div>
      ) : null}
    </ModalShell>
  )
}

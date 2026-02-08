import type { SystemCategoryEntity } from "@/types/db-schema"

export type CategoryKind = SystemCategoryEntity["kind"]

export type CategoryDraft = {
  id: string
  labelKey: string
  icon: string
  kind: CategoryKind
  order: number | null
  color: string
  parentId: string
}

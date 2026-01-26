import type { SystemCategory } from "@/types/db-schema"

export type CategoryKind = SystemCategory["kind"]

export type CategoryDraft = {
  id: string
  labelKey: string
  icon: string
  kind: CategoryKind
  order: number | null
  color: string
  parentId: string
}

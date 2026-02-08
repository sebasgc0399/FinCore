import {
  collection,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"

import { app, db } from "@/lib/firebase"
import type { SystemCategoryEntity } from "@/types/db-schema"

type CategoryKind = SystemCategoryEntity["kind"]

export type SystemCategoryPayload = {
  id: string
  labelKey: string
  icon: string
  kind: CategoryKind
  order?: number
  color?: string | null
  parentId?: string | null
}

export type ReorderSystemCategoriesPayload = {
  kind: CategoryKind
  orderedIds: string[]
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== ""

const isKind = (value: unknown): value is CategoryKind =>
  value === "expense" || value === "income"

const getOptionalString = (value: unknown): string | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined
  }

  return value.trim()
}

const getOptionalNullableString = (
  value: unknown
): string | null | undefined => {
  if (value === null) {
    return null
  }

  return getOptionalString(value)
}

const getOrder = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value
  }

  return null
}

const normalizeCategory = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): SystemCategoryEntity | null => {
  const data = snapshot.data()
  const id = snapshot.id
  const labelKey = getOptionalString(data.labelKey)
  const icon = getOptionalString(data.icon)
  const kind = isKind(data.kind) ? data.kind : null
  const order = getOrder(data.order)

  if (!isNonEmptyString(id) || !labelKey || !icon || !kind || order === null) {
    return null
  }

  const color = getOptionalString(data.color)
  const parentId = getOptionalNullableString(data.parentId)

  return {
    id,
    labelKey,
    icon,
    kind,
    order,
    ...(color ? { color } : {}),
    ...(parentId !== undefined ? { parentId } : {}),
  }
}

const functions = getFunctions(app)

const createSystemCategoryCallable = httpsCallable<
  SystemCategoryPayload,
  { status: string }
>(functions, "createSystemCategory")
const updateSystemCategoryCallable = httpsCallable<
  SystemCategoryPayload,
  { status: string }
>(functions, "updateSystemCategory")
const deleteSystemCategoryCallable = httpsCallable<
  { id: string },
  { status: string }
>(functions, "deleteSystemCategory")
const reorderSystemCategoriesCallable = httpsCallable<
  ReorderSystemCategoriesPayload,
  { status: string }
>(functions, "reorderSystemCategories")

export const listenSystemCategories = (
  onChange: (categories: SystemCategoryEntity[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return onSnapshot(
    collection(db, "system_categories"),
    (snapshot) => {
      const categories = snapshot.docs
        .map(normalizeCategory)
        .filter(
          (category): category is SystemCategoryEntity => Boolean(category)
        )

      onChange(categories)
    },
    (error) => {
      if (onError) {
        onError(error)
      }
    }
  )
}

export const createSystemCategory = async (
  payload: SystemCategoryPayload
): Promise<void> => {
  await createSystemCategoryCallable(payload)
}

export const updateSystemCategory = async (
  payload: SystemCategoryPayload
): Promise<void> => {
  await updateSystemCategoryCallable(payload)
}

export const deleteSystemCategory = async (id: string): Promise<void> => {
  await deleteSystemCategoryCallable({ id })
}

export const reorderSystemCategories = async (
  payload: ReorderSystemCategoriesPayload
): Promise<void> => {
  await reorderSystemCategoriesCallable(payload)
}

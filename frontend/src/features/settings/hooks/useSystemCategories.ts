import { useEffect, useMemo, useState } from "react"

import {
  listenSystemCategories,
  reorderSystemCategories,
} from "@/features/settings/services/system-categories"
import type { CategoryKind } from "@/features/settings/types/system-category-form"
import type { SystemCategory } from "@/types/db-schema"

type ReorderDirection = "up" | "down"

type UseSystemCategoriesResult = {
  sortedCategories: SystemCategory[]
  filteredCategories: SystemCategory[]
  loading: boolean
  loadError: boolean
  isReordering: boolean
  reorder: (categoryId: string, direction: ReorderDirection) => Promise<boolean>
}

const sortCategories = (a: SystemCategory, b: SystemCategory): number => {
  const orderDelta = a.order - b.order
  if (orderDelta !== 0) {
    return orderDelta
  }

  const kindDelta = a.kind.localeCompare(b.kind)
  if (kindDelta !== 0) {
    return kindDelta
  }

  return a.labelKey.localeCompare(b.labelKey)
}

export const useSystemCategories = (
  activeKind: CategoryKind
): UseSystemCategoriesResult => {
  const [categories, setCategories] = useState<SystemCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    const unsubscribe = listenSystemCategories(
      (nextCategories) => {
        setCategories(nextCategories)
        setLoadError(false)
        setLoading(false)
      },
      () => {
        setLoadError(true)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const sortedCategories = useMemo(
    () => [...categories].sort(sortCategories),
    [categories]
  )

  const filteredCategories = useMemo(
    () => sortedCategories.filter((category) => category.kind === activeKind),
    [sortedCategories, activeKind]
  )

  const reorder = async (
    categoryId: string,
    direction: ReorderDirection
  ): Promise<boolean> => {
    if (isReordering) {
      return false
    }

    const currentIndex = filteredCategories.findIndex(
      (category) => category.id === categoryId
    )
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (currentIndex === -1 || nextIndex < 0) {
      return false
    }

    if (nextIndex >= filteredCategories.length) {
      return false
    }

    const orderedIds = filteredCategories.map((category) => category.id)
    const [moved] = orderedIds.splice(currentIndex, 1)
    orderedIds.splice(nextIndex, 0, moved)

    setIsReordering(true)

    try {
      await reorderSystemCategories({ kind: activeKind, orderedIds })
      return true
    } catch {
      return false
    } finally {
      setIsReordering(false)
    }
  }

  return {
    sortedCategories,
    filteredCategories,
    loading,
    loadError,
    isReordering,
    reorder,
  }
}

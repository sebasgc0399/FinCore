import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import {
  collection,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"

import { app, db } from "@/lib/firebase"
import { resolveCategoryLabel } from "@/lib/resolve-category-label"

import { ModalShell } from "@/components/common/ModalShell"
import { SelectSheet } from "@/components/common/SelectSheet"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { SystemCategory } from "@/types/db-schema"

type CategoryKind = SystemCategory["kind"]

type SystemCategoryPayload = {
  id: string
  labelKey: string
  icon: string
  kind: CategoryKind
  order: number
  color?: string | null
  parentId?: string | null
}

type SystemCategoryFormState = {
  id: string
  labelKey: string
  icon: string
  kind: CategoryKind
  order: string
  color: string
  parentId: string
}

type FormMode = "create" | "edit"

const functions = getFunctions(app)
const createSystemCategory = httpsCallable<SystemCategoryPayload, { status: string }>(
  functions,
  "createSystemCategory"
)
const updateSystemCategory = httpsCallable<SystemCategoryPayload, { status: string }>(
  functions,
  "updateSystemCategory"
)
const deleteSystemCategory = httpsCallable<{ id: string }, { status: string }>(
  functions,
  "deleteSystemCategory"
)

const createEmptyFormState = (): SystemCategoryFormState => ({
  id: "",
  labelKey: "",
  icon: "",
  kind: "expense",
  order: "0",
  color: "",
  parentId: "",
})

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== ""

const isKind = (value: unknown): value is CategoryKind =>
  value === "expense" || value === "income"

const getOptionalString = (value: unknown): string | undefined => {
  if (isNonEmptyString(value)) {
    return value.trim()
  }

  return undefined
}

const getOptionalNullableString = (
  value: unknown
): string | null | undefined => {
  if (value === null) {
    return null
  }

  if (isNonEmptyString(value)) {
    return value.trim()
  }

  return undefined
}

const getOrder = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value
  }

  return null
}

const parseCategorySnapshot = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): SystemCategory | null => {
  const data = snapshot.data()
  const labelKey = isNonEmptyString(data.labelKey) ? data.labelKey.trim() : null
  const icon = isNonEmptyString(data.icon) ? data.icon.trim() : null
  const kind = isKind(data.kind) ? data.kind : null
  const order = getOrder(data.order)

  if (!labelKey || !icon || !kind || order === null) {
    return null
  }

  const color = getOptionalString(data.color)
  const parentId = getOptionalNullableString(data.parentId)

  return {
    id: snapshot.id,
    labelKey,
    icon,
    kind,
    order,
    ...(color ? { color } : {}),
    ...(parentId !== undefined ? { parentId } : {}),
  }
}

const getOptionalPayloadValue = (value: string): string | null => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export const SettingsAdminPage = () => {
  const { t } = useTranslation(["settings", "common"])
  const [categories, setCategories] = useState<SystemCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [formState, setFormState] = useState<SystemCategoryFormState>(
    createEmptyFormState
  )
  const [formOpen, setFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<SystemCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const unsubscribe = onSnapshot(
      collection(db, "system_categories"),
      (snapshot) => {
        if (!isMounted) {
          return
        }

        const nextCategories = snapshot.docs
          .map(parseCategorySnapshot)
          .filter((category): category is SystemCategory => Boolean(category))

        setCategories(nextCategories)
        setLoading(false)
        setLoadError(null)
      },
      () => {
        if (!isMounted) {
          return
        }

        setLoading(false)
        setLoadError(t("settings:admin.systemCategories.errors.load"))
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [t])

  const sortedCategories = useMemo(() => {
    const kindWeight = (kind: CategoryKind) => (kind === "expense" ? 0 : 1)

    return [...categories].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }

      const kindDelta = kindWeight(a.kind) - kindWeight(b.kind)
      if (kindDelta !== 0) {
        return kindDelta
      }

      return a.labelKey.localeCompare(b.labelKey)
    })
  }, [categories])

  const kindOptions = useMemo(
    () => [
      {
        value: "expense",
        label: t("settings:admin.systemCategories.kind.expense"),
      },
      {
        value: "income",
        label: t("settings:admin.systemCategories.kind.income"),
      },
    ],
    [t]
  )

  const handleFormOpenChange = (open: boolean): void => {
    if (!open) {
      setActionError(null)
    }
    setFormOpen(open)
  }

  const handleCreate = (): void => {
    setFormMode("create")
    setFormState(createEmptyFormState())
    setActionError(null)
    setFormOpen(true)
  }

  const handleEdit = (category: SystemCategory): void => {
    setFormMode("edit")
    setFormState({
      id: category.id,
      labelKey: category.labelKey,
      icon: category.icon,
      kind: category.kind,
      order: `${category.order}`,
      color: category.color ?? "",
      parentId: category.parentId ?? "",
    })
    setActionError(null)
    setFormOpen(true)
  }

  const handleFormChange =
    (field: keyof SystemCategoryFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const handleKindChange = (value: string): void => {
    const nextKind = value === "income" ? "income" : "expense"
    setFormState((current) => ({ ...current, kind: nextKind }))
  }

  const buildPayload = (): SystemCategoryPayload | null => {
    const id =
      formMode === "create" ? formState.id.trim() : formState.id.trim()
    const labelKey = formState.labelKey.trim()
    const icon = formState.icon.trim()
    const orderValue = Number(formState.order)

    if (!labelKey || !icon || !id) {
      setActionError(t("settings:admin.systemCategories.errors.validation"))
      return null
    }

    if (!Number.isInteger(orderValue) || orderValue < 0) {
      setActionError(t("settings:admin.systemCategories.errors.invalidOrder"))
      return null
    }

    return {
      id,
      labelKey,
      icon,
      kind: formState.kind,
      order: orderValue,
      color: getOptionalPayloadValue(formState.color),
      parentId: getOptionalPayloadValue(formState.parentId),
    }
  }

  const handleSubmit = async (): Promise<void> => {
    setActionError(null)
    const payload = buildPayload()

    if (!payload) {
      return
    }

    setIsSaving(true)

    try {
      if (formMode === "create") {
        await createSystemCategory(payload)
      } else {
        await updateSystemCategory(payload)
      }

      setFormOpen(false)
    } catch {
      setActionError(t("settings:admin.systemCategories.errors.save"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRequest = (category: SystemCategory): void => {
    setActionError(null)
    setPendingDelete(category)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!pendingDelete) {
      return
    }

    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteSystemCategory({ id: pendingDelete.id })
      setPendingDelete(null)
    } catch {
      setActionError(t("settings:admin.systemCategories.errors.delete"))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = (): void => {
    setPendingDelete(null)
  }

  const deleteLabel = pendingDelete ? resolveCategoryLabel(pendingDelete, t) : ""

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t("settings:admin.description")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              {t("settings:admin.systemCategories.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("settings:admin.systemCategories.description")}
            </p>
          </div>
          <Button onClick={handleCreate} type="button">
            {t("settings:admin.systemCategories.actions.new")}
          </Button>
        </div>
      </header>

      {actionError || loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError ?? loadError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">
          {t("settings:admin.systemCategories.loading")}
        </p>
      ) : sortedCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("settings:admin.systemCategories.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {sortedCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="space-y-2 pb-3">
                <CardTitle className="text-base">
                  {resolveCategoryLabel(category, t)}
                </CardTitle>
                <CardDescription>
                  {t("settings:admin.systemCategories.meta.labelKey", {
                    value: category.labelKey,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <p>
                    {t("settings:admin.systemCategories.meta.id", {
                      value: category.id,
                    })}
                  </p>
                  <p>
                    {t("settings:admin.systemCategories.meta.icon", {
                      value: category.icon,
                    })}
                  </p>
                  <p>
                    {t("settings:admin.systemCategories.meta.kind", {
                      value:
                        category.kind === "expense"
                          ? t("settings:admin.systemCategories.kind.expense")
                          : t("settings:admin.systemCategories.kind.income"),
                    })}
                  </p>
                  <p>
                    {t("settings:admin.systemCategories.meta.order", {
                      value: category.order,
                    })}
                  </p>
                  {category.color ? (
                    <p>
                      {t("settings:admin.systemCategories.meta.color", {
                        value: category.color,
                      })}
                    </p>
                  ) : null}
                  {category.parentId ? (
                    <p>
                      {t("settings:admin.systemCategories.meta.parentId", {
                        value: category.parentId,
                      })}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    type="button"
                  >
                    {t("settings:admin.systemCategories.actions.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRequest(category)}
                    type="button"
                  >
                    {t("settings:admin.systemCategories.actions.delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ModalShell
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title={
          formMode === "create"
            ? t("settings:admin.systemCategories.form.createTitle")
            : t("settings:admin.systemCategories.form.editTitle")
        }
        description={
          formMode === "create"
            ? t("settings:admin.systemCategories.form.createDescription")
            : t("settings:admin.systemCategories.form.editDescription")
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => handleFormOpenChange(false)}
              type="button"
            >
              {t("settings:admin.systemCategories.actions.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving} type="button">
              {formMode === "create"
                ? t("settings:admin.systemCategories.actions.create")
                : t("settings:admin.systemCategories.actions.save")}
            </Button>
          </div>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="category-id">
              {t("settings:admin.systemCategories.form.idLabel")}
            </Label>
            <Input
              id="category-id"
              value={formState.id}
              onChange={handleFormChange("id")}
              placeholder={t("settings:admin.systemCategories.form.idPlaceholder")}
              disabled={formMode === "edit"}
            />
            <p className="text-xs text-muted-foreground">
              {t("settings:admin.systemCategories.form.idHint")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-labelKey">
                {t("settings:admin.systemCategories.form.labelKeyLabel")}
              </Label>
              <Input
                id="category-labelKey"
                value={formState.labelKey}
                onChange={handleFormChange("labelKey")}
                placeholder={t(
                  "settings:admin.systemCategories.form.labelKeyPlaceholder"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-icon">
                {t("settings:admin.systemCategories.form.iconLabel")}
              </Label>
              <Input
                id="category-icon"
                value={formState.icon}
                onChange={handleFormChange("icon")}
                placeholder={t("settings:admin.systemCategories.form.iconPlaceholder")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectSheet
              label={t("settings:admin.systemCategories.form.kindLabel")}
              title={t("settings:admin.systemCategories.form.kindLabel")}
              description={t(
                "settings:admin.systemCategories.form.kindDescription"
              )}
              value={formState.kind}
              options={kindOptions}
              onChange={handleKindChange}
            />
            <div className="space-y-2">
              <Label htmlFor="category-order">
                {t("settings:admin.systemCategories.form.orderLabel")}
              </Label>
              <Input
                id="category-order"
                type="number"
                min={0}
                value={formState.order}
                onChange={handleFormChange("order")}
                placeholder={t("settings:admin.systemCategories.form.orderPlaceholder")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-color">
                {t("settings:admin.systemCategories.form.colorLabel")}
              </Label>
              <Input
                id="category-color"
                value={formState.color}
                onChange={handleFormChange("color")}
                placeholder={t("settings:admin.systemCategories.form.colorPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-parentId">
                {t("settings:admin.systemCategories.form.parentIdLabel")}
              </Label>
              <Input
                id="category-parentId"
                value={formState.parentId}
                onChange={handleFormChange("parentId")}
                placeholder={t(
                  "settings:admin.systemCategories.form.parentIdPlaceholder"
                )}
              />
            </div>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            handleDeleteCancel()
          }
        }}
        title={t("settings:admin.systemCategories.confirmDelete.title")}
        description={t("settings:admin.systemCategories.confirmDelete.description", {
          name: deleteLabel,
        })}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleDeleteCancel} type="button">
              {t("settings:admin.systemCategories.actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              type="button"
            >
              {t("settings:admin.systemCategories.confirmDelete.confirm")}
            </Button>
          </div>
        }
      >
        <div />
      </ModalShell>
    </section>
  )
}

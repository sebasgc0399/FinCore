import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ModalShell } from "@/components/common/ModalShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type IconEntry = {
  name: string
  Icon: LucideIcon
}

type IconPickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (icon: string) => void
  title: string
  description?: string
  searchLabel: string
  searchPlaceholder: string
  emptyLabel: string
  loadingLabel: string
  cancelLabel: string
}

export const IconPicker = ({
  open,
  onOpenChange,
  value,
  onChange,
  title,
  description,
  searchLabel,
  searchPlaceholder,
  emptyLabel,
  loadingLabel,
  cancelLabel,
}: IconPickerProps) => {
  const [icons, setIcons] = useState<IconEntry[] | null>(null)
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const searchId = useId()
  const isLoading = open && icons === null

  useEffect(() => {
    if (!open) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open || icons) {
      return
    }

    let isMounted = true

    void import("lucide-react")
      .then((module) => {
        if (!isMounted) {
          return
        }

        const iconMap = (module as { icons?: Record<string, LucideIcon> }).icons ?? {}
        const entries = Object.entries(iconMap)
          .map(([name, Icon]) => ({
            name,
            Icon: Icon as LucideIcon,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setIcons(entries)
      })
      .catch(() => {
        if (isMounted) {
          setIcons([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [open, icons])

  const filteredIcons = useMemo(() => {
    if (!icons) {
      return []
    }

    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return icons
    }

    return icons.filter(({ name }) =>
      name.toLowerCase().includes(normalizedQuery)
    )
  }, [icons, query])

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) {
      setQuery("")
    }
    onOpenChange(nextOpen)
  }

  const handleSelect = (iconName: string): void => {
    onChange(iconName)
    handleOpenChange(false)
  }

  const footer = (
    <Button
      className="h-11"
      type="button"
      variant="secondary"
      onClick={() => handleOpenChange(false)}
    >
      {cancelLabel}
    </Button>
  )

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      contentClassName="max-h-[80vh]"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium" htmlFor={searchId}>
            {searchLabel}
          </Label>
          <Input
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            ref={searchRef}
            value={query}
            className="h-11"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{loadingLabel}</p>
        ) : filteredIcons.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {filteredIcons.map(({ name, Icon }) => {
                const isSelected = value === name

                return (
                  <button
                    key={name}
                    type="button"
                    aria-label={name}
                    title={name}
                    onClick={() => handleSelect(name)}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-md border text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

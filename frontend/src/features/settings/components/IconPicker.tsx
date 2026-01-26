import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buildIconCatalog } from "@/features/settings/data/icon-catalog"

import { ModalShell } from "@/components/common/ModalShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMediaQuery } from "@/hooks/useMediaQuery"

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
  searchHint?: string
  searchPlaceholder: string
  emptyLabel: string
  loadingLabel: string
  cancelLabel: string
  loadMoreLabel?: string
  resultsLabel?: (shown: number, total: number) => string
}

const PAGE_SIZE = 80
const SEARCH_LIMIT = 200

export const IconPicker = ({
  open,
  onOpenChange,
  value,
  onChange,
  title,
  description,
  searchLabel,
  searchHint,
  searchPlaceholder,
  emptyLabel,
  loadingLabel,
  cancelLabel,
  loadMoreLabel,
  resultsLabel,
}: IconPickerProps) => {
  const [icons, setIcons] = useState<IconEntry[] | null>(null)
  const [query, setQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchId = useId()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isLoading = open && icons === null

  useEffect(() => {
    if (!open || isMobile) {
      return
    }

    setVisibleCount(PAGE_SIZE)

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, isMobile])

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
        const catalog = buildIconCatalog(iconMap)
        const entries = catalog.map((name) => ({
          name,
          Icon: iconMap[name],
        }))

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

  const normalizedQuery = query.trim().toLowerCase()
  const isSearching = normalizedQuery !== ""

  const filteredIcons = useMemo(() => {
    if (!icons) {
      return []
    }
    if (!normalizedQuery) {
      return icons
    }

    return icons.filter(({ name }) =>
      name.toLowerCase().includes(normalizedQuery)
    )
  }, [icons, normalizedQuery])

  const visibleIcons = useMemo(() => {
    if (!filteredIcons.length) {
      return []
    }

    if (isSearching) {
      return filteredIcons.slice(0, SEARCH_LIMIT)
    }

    return filteredIcons.slice(0, visibleCount)
  }, [filteredIcons, isSearching, visibleCount])

  const totalCount = filteredIcons.length
  const shownCount = visibleIcons.length
  const resultsText =
    resultsLabel && totalCount > 0 ? resultsLabel(shownCount, totalCount) : null
  const canLoadMore =
    Boolean(loadMoreLabel) && !isSearching && shownCount < totalCount

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

  const handleLoadMore = (): void => {
    setVisibleCount((current) =>
      Math.min(current + PAGE_SIZE, totalCount)
    )
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
        {searchHint ? (
          <p className="text-xs text-muted-foreground">{searchHint}</p>
        ) : null}
        {resultsText ? (
          <p className="text-xs text-muted-foreground">{resultsText}</p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{loadingLabel}</p>
        ) : visibleIcons.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {visibleIcons.map(({ name, Icon }) => {
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
        {canLoadMore ? (
          <Button
            className="h-11 w-full"
            type="button"
            variant="outline"
            onClick={handleLoadMore}
          >
            {loadMoreLabel}
          </Button>
        ) : null}
      </div>
    </ModalShell>
  )
}

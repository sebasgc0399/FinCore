import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { ModalShell } from "@/components/common/ModalShell"
import { Label } from "@/components/ui/label"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

type SelectSheetProps = {
  label?: string
  title: string
  description?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  contentClassName?: string
  snapPoints?: number[]
  activeSnapPoint?: number
  closeThreshold?: number
}

export const SelectSheet = ({
  label,
  title,
  description,
  value,
  options,
  onChange,
  placeholder,
  emptyLabel,
  disabled = false,
  className,
  buttonClassName,
  contentClassName,
  snapPoints,
  activeSnapPoint,
  closeThreshold,
}: SelectSheetProps) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstEnabledRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const wasOpenRef = useRef(false)
  const triggerId = useId()
  const listId = useId()

  const firstEnabledIndex = useMemo(
    () => options.findIndex((option) => !option.disabled),
    [options]
  )
  const resolvedActiveSnapPoint = useMemo(() => {
    if (activeSnapPoint !== undefined) {
      return activeSnapPoint
    }
    if (!snapPoints?.length) {
      return undefined
    }
    return Math.max(...snapPoints)
  }, [activeSnapPoint, snapPoints])
  const resolvedContentClassName = contentClassName ?? "max-h-[70vh]"
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )
  const displayValue = selectedOption?.label ?? placeholder ?? ""
  const isPlaceholder = !selectedOption && Boolean(placeholder)
  const ariaLabel = label ?? title

  const handleOpenChange = (nextOpen: boolean): void => {
    if (disabled && nextOpen) {
      return
    }
    if (nextOpen) {
      triggerRef.current?.blur()
    }
    setOpen(nextOpen)
  }

  const handleSelect = (option: SelectOption): void => {
    if (disabled || option.disabled) {
      return
    }
    if (option.value !== value) {
      onChange(option.value)
    }
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        triggerRef.current?.focus()
      }
      wasOpenRef.current = false
      return
    }

    wasOpenRef.current = true
    const frame = window.requestAnimationFrame(() => {
      if (firstEnabledRef.current) {
        firstEnabledRef.current.focus()
        return
      }
      listboxRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={triggerId} className="text-sm font-medium">
          {label}
        </Label>
      ) : null}
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        aria-controls={listId}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isPlaceholder && "text-muted-foreground",
          buttonClassName
        )}
        disabled={disabled}
        id={triggerId}
        onClick={() => handleOpenChange(true)}
        ref={triggerRef}
        type="button"
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <ModalShell
        open={open}
        onOpenChange={handleOpenChange}
        title={title}
        description={description}
        contentClassName={resolvedContentClassName}
        snapPoints={snapPoints}
        activeSnapPoint={resolvedActiveSnapPoint}
        closeThreshold={closeThreshold}
      >
        <div className="pb-2">
          <div
            className="space-y-1"
            role="listbox"
            id={listId}
            ref={listboxRef}
            tabIndex={-1}
          >
            {options.length === 0 ? (
              emptyLabel ? (
                <p className="text-sm text-muted-foreground">{emptyLabel}</p>
              ) : null
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === value
                const isFirstEnabled = index === firstEnabledIndex

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors active:bg-muted",
                      isSelected
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-muted/60",
                      option.disabled && "cursor-not-allowed opacity-50"
                    )}
                    ref={isFirstEnabled ? firstEnabledRef : undefined}
                    autoFocus={open && isFirstEnabled}
                  >
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    <Check
                      className={cn(
                        "mt-1 h-4 w-4",
                        isSelected ? "text-foreground" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                )
              })
            )}
          </div>
        </div>
      </ModalShell>
    </div>
  )
}

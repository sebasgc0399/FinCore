import { useMemo, useRef, useState, type ChangeEvent } from "react"
import { HexColorPicker } from "react-colorful"
import { Paintbrush } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ColorPickerProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  inputPlaceholder: string
  className?: string
  inputId?: string
  disabled?: boolean
}

const DEFAULT_COLOR = "#0F172A"

const isValidHexColor = (value: string): boolean =>
  /^#[0-9A-Fa-f]{6}$/.test(value)

const normalizeHex = (value: string): string | null => {
  const trimmed = value.trim()
  if (trimmed === "") {
    return null
  }

  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
  return isValidHexColor(normalized) ? normalized : null
}

export const ColorPicker = ({
  value,
  onChange,
  placeholder,
  inputPlaceholder,
  className,
  inputId,
  disabled = false,
}: ColorPickerProps) => {
  const [open, setOpen] = useState(false)
  const [pickerColor, setPickerColor] = useState(DEFAULT_COLOR)
  const [hexInput, setHexInput] = useState("")
  const hasPendingCommitRef = useRef(false)

  const normalizedValue = useMemo(() => normalizeHex(value), [value])
  const displayValue = normalizedValue ?? ""

  const syncDraftFromValue = (nextValue: string | null): void => {
    if (nextValue) {
      setPickerColor(nextValue)
      setHexInput(nextValue.slice(1))
      return
    }

    setPickerColor(DEFAULT_COLOR)
    setHexInput("")
  }

  const commitIfPending = (): void => {
    if (!hasPendingCommitRef.current) {
      return
    }

    hasPendingCommitRef.current = false
    if (isValidHexColor(pickerColor)) {
      onChange(pickerColor)
    }
  }

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) {
      commitIfPending()
    } else {
      syncDraftFromValue(normalizedValue)
    }
    setOpen(nextOpen)
  }

  const handlePickerChange = (nextColor: string): void => {
    setPickerColor(nextColor)
    setHexInput(nextColor.slice(1))
    hasPendingCommitRef.current = true
  }

  const handleHexInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = event.target.value.trim().replace(/#/g, "")
    setHexInput(cleaned)

    if (cleaned.length === 0) {
      hasPendingCommitRef.current = false
      setPickerColor(DEFAULT_COLOR)
      onChange("")
      return
    }

    const normalized = `#${cleaned}`
    if (isValidHexColor(normalized)) {
      setPickerColor(normalized)
      hasPendingCommitRef.current = false
      onChange(normalized)
    } else {
      hasPendingCommitRef.current = true
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-start gap-2 px-3 text-left font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          {displayValue ? (
            <span
              className="h-4 w-4 rounded-full border border-muted-foreground/20 shadow-sm"
              style={{ backgroundColor: displayValue }}
            />
          ) : (
            <Paintbrush className="h-4 w-4" />
          )}
          <span className="truncate">{displayValue || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-col gap-3">
          <div onPointerUp={commitIfPending}>
            <HexColorPicker
              color={pickerColor}
              onChange={handlePickerChange}
              className="!h-[150px] !w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">#</span>
            <Input
              id={inputId}
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder={inputPlaceholder}
              className="h-9 uppercase"
              maxLength={6}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

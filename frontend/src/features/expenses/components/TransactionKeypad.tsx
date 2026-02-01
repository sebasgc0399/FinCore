import { useRef } from "react"
import { Delete, Minus, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import type { TransactionKind } from "@/features/expenses/types/transaction"

type TransactionKeypadProps = {
  amount: string
  kind: TransactionKind
  onChange: (value: string) => void
  onSave: () => void
  saveDisabled: boolean
  isSaving: boolean
}

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "backspace"],
] as const

export const TransactionKeypad = ({
  amount,
  kind,
  onChange,
  onSave,
  saveDisabled,
  isSaving,
}: TransactionKeypadProps) => {
  const { t } = useTranslation("common")
  const longPressTimeoutRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  const accentClasses =
    kind === "expense"
      ? "bg-rose-600 text-white hover:bg-rose-600/90"
      : "bg-emerald-600 text-white hover:bg-emerald-600/90"

  const SaveIcon = kind === "expense" ? Minus : Plus

  const applyInput = (key: string): void => {
    if (key === "backspace") {
      onChange(amount.slice(0, -1))
      return
    }

    if (key === ".") {
      if (amount.includes(".")) {
        return
      }
      onChange(amount === "" ? "0." : `${amount}.`)
      return
    }

    onChange(`${amount}${key}`)
  }

  const handleBackspacePointerDown = (): void => {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current)
    }

    longPressTriggeredRef.current = false
    longPressTimeoutRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      onChange("")
    }, 500)
  }

  const handleBackspacePointerEnd = (): void => {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }

    if (!longPressTriggeredRef.current) {
      onChange(amount.slice(0, -1))
    }
  }

  return (
    <div className="grid grid-cols-[1fr_104px] gap-1.5">
      <div className="grid grid-cols-3 grid-rows-4 gap-1.5">
        {KEYPAD_ROWS.flat().map((key) => {
          if (key === "backspace") {
            return (
              <button
                key={key}
                type="button"
                aria-label={t("common:transaction.keypad.backspace")}
                title={t("common:transaction.keypad.clear")}
                onPointerDown={handleBackspacePointerDown}
                onPointerUp={handleBackspacePointerEnd}
                onPointerLeave={handleBackspacePointerEnd}
                onPointerCancel={handleBackspacePointerEnd}
                className="flex h-11 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                disabled={isSaving}
              >
                <Delete className="h-4 w-4" aria-hidden="true" />
              </button>
            )
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => applyInput(key)}
              className="flex h-11 items-center justify-center rounded-md border border-input bg-background text-base font-semibold shadow-sm transition-colors hover:bg-muted"
              disabled={isSaving}
            >
              {key}
            </button>
          )
        })}
      </div>
      <Button
        type="button"
        className={cn(
          "flex h-full flex-col items-center justify-center gap-2 rounded-md text-base font-semibold",
          accentClasses
        )}
        disabled={saveDisabled || isSaving}
        onClick={onSave}
      >
        <SaveIcon className="h-4 w-4" aria-hidden="true" />
        {isSaving ? t("common:actions.saving") : t("common:actions.save")}
      </Button>
    </div>
  )
}

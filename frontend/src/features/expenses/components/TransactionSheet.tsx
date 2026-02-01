import { useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { ModalShell } from "@/components/common/ModalShell"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { TransactionCategoryChips } from "@/features/expenses/components/TransactionCategoryChips"
import { TransactionDetails } from "@/features/expenses/components/TransactionDetails"
import { TransactionKeypad } from "@/features/expenses/components/TransactionKeypad"

import type {
  TransactionCategory,
  TransactionKind,
} from "@/features/expenses/types/transaction"

type TransactionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_OPTIONS: TransactionCategory[] = [
  { id: "food", kind: "expense", labelKey: "categories.food" },
  { id: "transport", kind: "expense", labelKey: "categories.transport" },
  { id: "home", kind: "expense", labelKey: "categories.home" },
  { id: "services", kind: "expense", labelKey: "categories.services" },
  { id: "health", kind: "expense", labelKey: "categories.health" },
  {
    id: "entertainment",
    kind: "expense",
    labelKey: "categories.entertainment",
  },
  { id: "shopping", kind: "expense", labelKey: "categories.shopping" },
  { id: "travel", kind: "expense", labelKey: "categories.travel" },
  { id: "education", kind: "expense", labelKey: "categories.education" },
  { id: "salary", kind: "income", labelKey: "categories.salary" },
  { id: "freelance", kind: "income", labelKey: "categories.freelance" },
  { id: "gift", kind: "income", labelKey: "categories.gift" },
  { id: "investment", kind: "income", labelKey: "categories.investment" },
]

const RECENT_CATEGORY_IDS = [
  "food",
  "transport",
  "home",
  "shopping",
  "salary",
  "freelance",
]

const DEFAULT_PAYMENT_METHOD = "card"
const DEFAULT_FREQUENCY = "monthly"

const getToday = (): string => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

const sanitizeAmount = (value: string): string => {
  const normalized = value.replace(/,/g, ".").replace(/[^\d.]/g, "")
  const parts = normalized.split(".")
  if (parts.length <= 2) {
    return normalized
  }

  return `${parts[0]}.${parts.slice(1).join("")}`
}

export const TransactionSheet = ({
  open,
  onOpenChange,
}: TransactionSheetProps) => {
  const { t } = useTranslation("common")
  const [kind, setKind] = useState<TransactionKind>("expense")
  const [amount, setAmount] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )
  const [note, setNote] = useState("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [date, setDate] = useState(getToday)
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD)
  const [recurring, setRecurring] = useState(false)
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY)
  const [isSaving, setIsSaving] = useState(false)

  const accentTextClasses =
    kind === "expense" ? "text-rose-600" : "text-emerald-600"
  const ActiveIcon = kind === "expense" ? Minus : Plus

  const segmentedOptions = useMemo(
    () => [
      {
        value: "expense" as const,
        label: t("common:transaction.type.expense"),
        activeClasses: "bg-rose-600/10 text-rose-600",
      },
      {
        value: "income" as const,
        label: t("common:transaction.type.income"),
        activeClasses: "bg-emerald-600/10 text-emerald-600",
      },
    ],
    [t]
  )

  const resetDetails = (): void => {
    setSelectedCategoryId(null)
    setDetailsOpen(false)
    setDate(getToday())
    setPaymentMethod(DEFAULT_PAYMENT_METHOD)
    setRecurring(false)
    setFrequency(DEFAULT_FREQUENCY)
  }

  const resetAll = (): void => {
    setKind("expense")
    setAmount("")
    setNote("")
    setIsSaving(false)
    resetDetails()
  }

  const handleKindChange = (nextKind: TransactionKind): void => {
    if (nextKind !== kind) {
      setKind(nextKind)
      resetDetails()
    }
  }

  const handleAmountChange = (value: string): void => {
    setAmount(sanitizeAmount(value))
  }

  const amountValue = Number.parseFloat(amount)
  const hasValidAmount = Number.isFinite(amountValue) && amountValue > 0
  const canSave = hasValidAmount && Boolean(selectedCategoryId)

  const handleSave = (): void => {
    if (!canSave || isSaving) {
      return
    }

    setIsSaving(true)

    const payload = {
      kind,
      amount: amountValue,
      categoryId: selectedCategoryId,
      note: note.trim(),
      date,
      paymentMethod,
      recurring,
      frequency: recurring ? frequency : null,
    }

    void payload

    window.setTimeout(() => {
      setIsSaving(false)
      onOpenChange(false)
    }, 600)
  }

  const toggleLabel = detailsOpen
    ? t("common:transaction.detailsCollapse")
    : t("common:transaction.detailsExpand")

  return (
    <ModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetAll()
        }
        onOpenChange(nextOpen)
      }}
      title={t("common:transaction.sheetTitle")}
      footer={
        <TransactionKeypad
          amount={amount}
          kind={kind}
          onChange={handleAmountChange}
          onSave={handleSave}
          saveDisabled={!canSave}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="flex w-full max-w-sm rounded-full bg-muted p-1">
            {segmentedOptions.map((option) => {
              const isActive = kind === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? option.activeClasses
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={isActive}
                  onClick={() => handleKindChange(option.value)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <ActiveIcon
              className={cn("h-6 w-6", accentTextClasses)}
              aria-hidden="true"
            />
            <Input
              value={amount}
              onChange={(event) => handleAmountChange(event.target.value)}
              inputMode="decimal"
              placeholder={t("common:transaction.amountPlaceholder")}
              className={cn(
                "h-12 w-[200px] border-none bg-transparent text-center text-3xl font-semibold shadow-none focus-visible:ring-0 sm:text-4xl",
                accentTextClasses
              )}
            />
          </div>
        </div>

        <TransactionCategoryChips
          kind={kind}
          categories={CATEGORY_OPTIONS}
          recentIds={RECENT_CATEGORY_IDS}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("common:transaction.noteLabel")}
          </p>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("common:transaction.notePlaceholder")}
            className="min-h-[52px] resize-none"
            rows={2}
          />
        </div>

        <button
          className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          type="button"
          onClick={() => setDetailsOpen((current) => !current)}
        >
          {toggleLabel}
        </button>

        <TransactionDetails
          open={detailsOpen}
          date={date}
          onDateChange={setDate}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          recurring={recurring}
          onRecurringChange={setRecurring}
          frequency={frequency}
          onFrequencyChange={setFrequency}
        />
      </div>
    </ModalShell>
  )
}

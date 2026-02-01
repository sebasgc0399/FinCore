import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type TransactionDetailsProps = {
  open: boolean
  date: string
  onDateChange: (value: string) => void
  paymentMethod: string
  onPaymentMethodChange: (value: string) => void
  recurring: boolean
  onRecurringChange: (value: boolean) => void
  frequency: string
  onFrequencyChange: (value: string) => void
}

const PAYMENT_METHODS = ["card", "cash", "transfer"] as const
const FREQUENCIES = ["weekly", "monthly", "yearly"] as const

export const TransactionDetails = ({
  open,
  date,
  onDateChange,
  paymentMethod,
  onPaymentMethodChange,
  recurring,
  onRecurringChange,
  frequency,
  onFrequencyChange,
}: TransactionDetailsProps) => {
  const { t } = useTranslation("common")

  const paymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.map((value) => ({
        value,
        label: t(`common:transaction.details.payment.${value}`),
      })),
    [t]
  )

  const frequencyOptions = useMemo(
    () =>
      FREQUENCIES.map((value) => ({
        value,
        label: t(`common:transaction.details.frequency.${value}`),
      })),
    [t]
  )

  if (!open) {
    return null
  }

  return (
    <div className="space-y-4 rounded-md border border-dashed p-3">
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="transaction-date">
          {t("common:transaction.details.dateLabel")}
        </Label>
        <Input
          id="transaction-date"
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="transaction-payment">
          {t("common:transaction.details.paymentLabel")}
        </Label>
        <select
          id="transaction-payment"
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          value={paymentMethod}
          onChange={(event) => onPaymentMethodChange(event.target.value)}
        >
          {paymentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium" htmlFor="transaction-recurring">
          {t("common:transaction.details.recurringLabel")}
        </Label>
        <Switch
          id="transaction-recurring"
          checked={recurring}
          onCheckedChange={onRecurringChange}
        />
      </div>

      {recurring ? (
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="transaction-frequency">
            {t("common:transaction.details.frequencyLabel")}
          </Label>
          <select
            id="transaction-frequency"
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            value={frequency}
            onChange={(event) => onFrequencyChange(event.target.value)}
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  )
}

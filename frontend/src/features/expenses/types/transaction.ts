export type TransactionKind = "expense" | "income"

export type TransactionCategory = {
  id: string
  kind: TransactionKind
  labelKey: string
}

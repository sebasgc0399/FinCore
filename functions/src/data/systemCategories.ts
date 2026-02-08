type SystemCategorySeed = {
  id: string;
  labelKey: string;
  icon: string;
  kind: "expense" | "income";
  order: number;
  color?: string | null;
  parentId?: string | null;
};

export const systemCategories: readonly SystemCategorySeed[] = [
  {
    id: "otros",
    labelKey: "categories.other",
    icon: "Tag",
    kind: "expense",
    order: 0,
  },
  {
    id: "ingreso",
    labelKey: "categories.income",
    icon: "Wallet",
    kind: "income",
    order: 1,
  },
];

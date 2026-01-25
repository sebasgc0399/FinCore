import { z } from "zod";
import { Timestamp } from "firebase/firestore";

const nonEmptyString = z.string().min(1);

export const TimestampSchema = z.instanceof(Timestamp);
const TimestampOrNullSchema = TimestampSchema.nullable();
const TimestampOrNumberOrNullSchema = z.union([TimestampSchema, z.number(), z.null()]);

export const TransactionTypeSchema = z.enum(["expense", "income"]);
export const PaymentMethodSchema = z.enum(["cash", "debit", "credit", "digital", "other"]);
export const AdvisorModeSchema = z.enum(["amable", "reganon"]);
export const UserRoleSchema = z.enum([
  "admin",
  "free",
  "paid_byok",
  "paid_managed",
  "gifted_managed",
]);
export const KeyPreferenceSchema = z.enum(["byok", "managed"]);
export const SubscriptionStatusSchema = z.enum(["active", "expired"]);
export const SubscriptionSourceSchema = z.enum(["manual", "stripe", "promo", "wompi"]);
export const CurrencyCodeSchema = z.enum(["COP", "USD"]);
export const LanguageCodeSchema = z.enum(["es", "en"]);
export const ThemeModeSchema = z.enum(["system", "manual"]);
export const ThemeSchema = z.enum(["light", "dark"]);
export const TransactionSourceSchema = z.enum(["manual", "ai", "template", "recurring", "import"]);
export const ObjectiveTypeSchema = z.enum(["goal", "debt"]);
export const ObjectiveStatusSchema = z.enum(["active", "completed", "archived"]);
export const ObjectiveEntryKindSchema = z.enum(["deposit", "withdraw", "payment"]);
export const TemplateFrequencySchema = z.enum(["weekly", "biweekly", "monthly", "yearly"]);

const DateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const MonthKeySchema = z.string().regex(/^\d{4}-\d{2}$/);

export const UserDocSchema = z.object({
  profile: z.object({
    displayName: nonEmptyString,
    email: nonEmptyString.email(),
    photoURL: z.string().url().optional(),
  }),
  preferences: z.object({
    currency: CurrencyCodeSchema,
    language: LanguageCodeSchema,
    advisorMode: AdvisorModeSchema,
    themeMode: ThemeModeSchema,
    theme: ThemeSchema,
  }),
  auth: z.object({
    role: UserRoleSchema,
    openaiKeyStored: z.boolean(),
    preferredKey: KeyPreferenceSchema.optional(),
    subscription: z.object({
      status: SubscriptionStatusSchema,
      source: SubscriptionSourceSchema,
      expiresAt: TimestampOrNumberOrNullSchema.optional(),
      updatedAt: TimestampOrNullSchema.optional(),
    }),
  }),
  metadata: z.object({
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
    lastLoginAt: TimestampSchema.optional(),
  }),
});

export const CategorySnapshotSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  icon: nonEmptyString,
  color: z.string().optional(),
});

export const TransactionSchema = z.object({
  id: nonEmptyString,
  userId: nonEmptyString,
  amountCents: z.number().int().nonnegative(),
  type: TransactionTypeSchema,
  date: TimestampSchema,
  dateKey: DateKeySchema,
  monthKey: MonthKeySchema,
  categoryId: nonEmptyString,
  paymentMethod: PaymentMethodSchema,
  note: z.string().optional(),
  tags: z.array(nonEmptyString).optional(),
  source: TransactionSourceSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  categorySnapshot: CategorySnapshotSchema.optional(),
});

export const SystemCategorySchema = z.object({
  id: nonEmptyString,
  labelKey: nonEmptyString,
  icon: nonEmptyString,
  color: z.string().optional(),
  kind: TransactionTypeSchema,
  order: z.number().int().nonnegative(),
  parentId: nonEmptyString.nullable().optional(),
});

export const UserCategorySchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  icon: nonEmptyString,
  color: z.string().optional(),
  kind: TransactionTypeSchema,
  order: z.number().int().nonnegative(),
  isArchived: z.boolean(),
  parentId: nonEmptyString.nullable().optional(),
});

export const BudgetSchema = z.object({
  id: nonEmptyString,
  userId: nonEmptyString,
  monthKey: MonthKeySchema,
  totalLimitCents: z.number().int().nonnegative(),
  categoryLimitsCents: z.record(z.string(), z.number().int().nonnegative()),
  updatedAt: TimestampSchema,
  spentCents: z.number().int().nonnegative().optional(),
  categorySpentCents: z
    .record(z.string(), z.number().int().nonnegative())
    .optional(),
});

export const ObjectiveSchema = z.object({
  id: nonEmptyString,
  userId: nonEmptyString,
  type: ObjectiveTypeSchema,
  name: nonEmptyString,
  targetAmountCents: z.number().int().nonnegative(),
  currentAmountCents: z.number().int().nonnegative(),
  status: ObjectiveStatusSchema,
  deadline: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ObjectiveEntrySchema = z.object({
  id: nonEmptyString,
  userId: nonEmptyString,
  amountCents: z.number().int().nonnegative(),
  kind: ObjectiveEntryKindSchema,
  note: z.string().optional(),
  effectiveDate: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  linkedTransactionId: nonEmptyString.nullable().optional(),
});

export const TransactionTemplateSchema = z.object({
  id: nonEmptyString,
  userId: nonEmptyString,
  name: nonEmptyString,
  amountCents: z.number().int().nonnegative().optional(),
  categoryId: nonEmptyString.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  note: z.string().optional(),
  type: TransactionTypeSchema.optional(),
  recurring: z.boolean().optional(),
  frequency: TemplateFrequencySchema.optional(),
  nextRunAt: TimestampOrNullSchema.optional(),
  lastUsedAt: TimestampOrNullSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const UsageDocSchema = z.object({
  uid: nonEmptyString,
  week: DateKeySchema,
  parse: z.number().int().nonnegative().optional(),
  analyze: z.number().int().nonnegative().optional(),
  date: DateKeySchema.optional(),
  updatedAt: TimestampSchema.optional(),
});

export const PaymentDocSchema = z.object({
  transactionId: nonEmptyString,
  uid: nonEmptyString,
  targetPlan: z.enum(["byok", "pro"]),
  months: z.number().int().positive(),
  amountInCents: z.number().int().nonnegative(),
  currency: nonEmptyString,
  reference: nonEmptyString,
  status: z.enum(["PENDING", "APPROVED", "DECLINED", "ERROR"]),
  processed: z.boolean(),
  webhookCount: z.number().int().nonnegative(),
  createdAt: TimestampSchema,
  lastWebhookAt: TimestampSchema,
});

export const AdvisorChatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: nonEmptyString,
  at: z.number(),
});

export const AdvisorChatSessionSchema = z.object({
  createdAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional(),
  tone: AdvisorModeSchema.optional(),
  rangeFrom: DateKeySchema.optional(),
  rangeTo: DateKeySchema.optional(),
  conversationSummary: z.string().optional(),
  lastTurns: z.array(AdvisorChatTurnSchema).optional(),
  lastContextHash: z.string().optional(),
  messageCount: z.number().int().nonnegative().optional(),
});

export type UserDoc = z.infer<typeof UserDocSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type SystemCategory = z.infer<typeof SystemCategorySchema>;
export type UserCategory = z.infer<typeof UserCategorySchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type Objective = z.infer<typeof ObjectiveSchema>;
export type ObjectiveEntry = z.infer<typeof ObjectiveEntrySchema>;
export type TransactionTemplate = z.infer<typeof TransactionTemplateSchema>;
export type UsageDoc = z.infer<typeof UsageDocSchema>;
export type PaymentDoc = z.infer<typeof PaymentDocSchema>;
export type AdvisorChatSession = z.infer<typeof AdvisorChatSessionSchema>;

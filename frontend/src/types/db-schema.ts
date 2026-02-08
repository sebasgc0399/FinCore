import { Timestamp } from "firebase/firestore";
import { z } from "zod";

const nonEmptyString = z.string().min(1);
const NonNegativeIntSchema = z.number().int().nonnegative();

export const TimestampSchema = z.instanceof(Timestamp);
const TimestampOrNullSchema = TimestampSchema.nullable();
const TimestampOrNumberOrNullSchema = z.union([
  TimestampSchema,
  z.number(),
  z.null(),
]);

export const DateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const MonthKeySchema = z.string().regex(/^\d{4}-\d{2}$/);

export const TransactionTypeSchema = z.enum(["expense", "income"]);
export const PaymentMethodSchema = z.enum([
  "cash",
  "debit_card",
  "credit_card",
  "bank_transfer",
  "digital_wallet",
  "other",
]);
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
export const SubscriptionSourceSchema = z.enum([
  "manual",
  "stripe",
  "promo",
  "wompi",
]);
export const CurrencyCodeSchema = z.enum(["COP", "USD"]);
export const LanguageCodeSchema = z.enum(["es", "en"]);
export const ThemeModeSchema = z.enum(["system", "manual"]);
export const ThemeSchema = z.enum(["light", "dark"]);
export const TransactionSourceSchema = z.enum([
  "manual",
  "ai",
  "template",
  "recurring",
  "import",
]);
export const ObjectiveTypeSchema = z.enum(["goal", "debt"]);
export const ObjectiveStatusSchema = z.enum(["active", "completed", "archived"]);
export const ObjectiveEntryKindSchema = z.enum(["deposit", "withdraw", "payment"]);
export const TemplateFrequencySchema = z.enum([
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
]);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type TemplateFrequency = z.infer<typeof TemplateFrequencySchema>;

const UserProfileDocSchema = z.object({
  displayName: nonEmptyString,
  email: nonEmptyString.email(),
  photoURL: z.string().url().optional(),
});

const UserPreferencesDocSchema = z.object({
  currency: CurrencyCodeSchema,
  language: LanguageCodeSchema,
  advisorMode: AdvisorModeSchema,
  themeMode: ThemeModeSchema,
  theme: ThemeSchema,
});

const UserAuthDocSchema = z.object({
  role: UserRoleSchema,
  openaiKeyStored: z.boolean(),
  preferredKey: KeyPreferenceSchema.optional(),
  subscription: z.object({
    status: SubscriptionStatusSchema,
    source: SubscriptionSourceSchema,
    expiresAt: TimestampOrNullSchema.optional(),
    updatedAt: TimestampOrNullSchema.optional(),
  }),
});

const UserMetadataDocSchema = z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  lastLoginAt: TimestampSchema.optional(),
});

export const UserDocSchema = z.object({
  uid: nonEmptyString,
  profile: UserProfileDocSchema,
  preferences: UserPreferencesDocSchema,
  auth: UserAuthDocSchema,
  metadata: UserMetadataDocSchema,
});

export const UserInputSchema = z.object({
  uid: nonEmptyString.optional(),
  profile: UserProfileDocSchema.partial().optional(),
  preferences: UserPreferencesDocSchema.partial().optional(),
  auth: z
    .object({
      role: UserRoleSchema.optional(),
      openaiKeyStored: z.boolean().optional(),
      preferredKey: KeyPreferenceSchema.optional(),
      subscription: z
        .object({
          status: SubscriptionStatusSchema.optional(),
          source: SubscriptionSourceSchema.optional(),
          expiresAt: TimestampOrNumberOrNullSchema.optional(),
          updatedAt: TimestampOrNullSchema.optional(),
        })
        .optional(),
    })
    .optional(),
  metadata: z
    .object({
      createdAt: TimestampSchema.optional(),
      updatedAt: TimestampSchema.optional(),
      lastLoginAt: TimestampSchema.optional(),
    })
    .optional(),
});

export const UserEntitySchema = UserDocSchema.extend({
  id: nonEmptyString.optional(),
});

export const CategorySnapshotDocSchema = z.object({
  label: nonEmptyString,
  icon: nonEmptyString,
  color: z.string().optional(),
});

export const CategorySnapshotInputSchema = CategorySnapshotDocSchema.partial();
export const CategorySnapshotEntitySchema = CategorySnapshotDocSchema;

export const TransactionDocSchema = z.object({
  amountCents: NonNegativeIntSchema,
  type: TransactionTypeSchema,
  date: TimestampSchema,
  dateKey: DateKeySchema,
  monthKey: MonthKeySchema,
  categoryId: nonEmptyString,
  paymentMethod: PaymentMethodSchema,
  note: z.string().max(500).optional(),
  tags: z.array(nonEmptyString.max(40)).max(20).optional(),
  source: TransactionSourceSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  categorySnapshot: CategorySnapshotDocSchema.optional(),
});

export const TransactionInputSchema = z.object({
  id: nonEmptyString.optional(),
  amountCents: NonNegativeIntSchema.optional(),
  type: TransactionTypeSchema.optional(),
  date: z.union([TimestampSchema, nonEmptyString]).optional(),
  dateKey: DateKeySchema.optional(),
  monthKey: MonthKeySchema.optional(),
  categoryId: nonEmptyString.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  note: z.string().max(500).optional(),
  tags: z.array(nonEmptyString.max(40)).max(20).optional(),
  source: TransactionSourceSchema.optional(),
  createdAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional(),
  categorySnapshot: CategorySnapshotInputSchema.optional(),
});

export const TransactionEntitySchema = TransactionDocSchema.extend({
  id: nonEmptyString,
});

export const SystemCategoryDocSchema = z.object({
  labelKey: nonEmptyString,
  icon: nonEmptyString,
  color: z.string().optional(),
  kind: TransactionTypeSchema,
  order: NonNegativeIntSchema,
  parentId: nonEmptyString.nullable().optional(),
});

export const SystemCategoryInputSchema = SystemCategoryDocSchema.extend({
  id: nonEmptyString,
});

export const SystemCategoryEntitySchema = SystemCategoryDocSchema.extend({
  id: nonEmptyString,
});

export const UserCategoryDocSchema = z.object({
  label: nonEmptyString,
  icon: nonEmptyString,
  color: z.string().optional(),
  kind: TransactionTypeSchema,
  order: NonNegativeIntSchema,
  isArchived: z.boolean(),
  parentId: nonEmptyString.nullable().optional(),
});

export const UserCategoryInputSchema = UserCategoryDocSchema.partial().extend({
  id: nonEmptyString.optional(),
});

export const UserCategoryEntitySchema = UserCategoryDocSchema.extend({
  id: nonEmptyString,
});

export const BudgetDocSchema = z.object({
  monthKey: MonthKeySchema,
  totalLimitCents: NonNegativeIntSchema,
  categoryLimitsCents: z.record(z.string(), NonNegativeIntSchema),
  updatedAt: TimestampSchema,
  spentCents: NonNegativeIntSchema.optional(),
  categorySpentCents: z.record(z.string(), NonNegativeIntSchema).optional(),
});

export const BudgetInputSchema = BudgetDocSchema.partial().extend({
  monthKey: MonthKeySchema,
});

export const BudgetEntitySchema = BudgetDocSchema.extend({
  id: nonEmptyString,
});

export const ObjectiveDocSchema = z.object({
  type: ObjectiveTypeSchema,
  name: nonEmptyString,
  targetAmountCents: NonNegativeIntSchema,
  currentAmountCents: NonNegativeIntSchema,
  status: ObjectiveStatusSchema,
  deadline: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const ObjectiveInputSchema = ObjectiveDocSchema.partial().extend({
  id: nonEmptyString.optional(),
});

export const ObjectiveEntitySchema = ObjectiveDocSchema.extend({
  id: nonEmptyString,
});

export const ObjectiveEntryDocSchema = z.object({
  amountCents: NonNegativeIntSchema,
  kind: ObjectiveEntryKindSchema,
  note: z.string().max(500).optional(),
  effectiveDate: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  linkedTransactionId: nonEmptyString.nullable().optional(),
});

export const ObjectiveEntryInputSchema = ObjectiveEntryDocSchema.partial().extend({
  id: nonEmptyString.optional(),
});

export const ObjectiveEntryEntitySchema = ObjectiveEntryDocSchema.extend({
  id: nonEmptyString,
});

export const TransactionTemplateScheduleDocSchema = z.object({
  frequency: TemplateFrequencySchema,
  nextRunAt: TimestampSchema,
  lastRunAt: TimestampOrNullSchema.optional(),
});

export const TransactionTemplateScheduleInputSchema = z.object({
  frequency: TemplateFrequencySchema.optional(),
  nextRunAt: z.union([TimestampSchema, nonEmptyString]).optional(),
  lastRunAt: TimestampOrNullSchema.optional(),
});

export const TransactionTemplateScheduleEntitySchema =
  TransactionTemplateScheduleDocSchema;

export const TransactionTemplateDocSchema = z.object({
  name: nonEmptyString,
  amountCents: NonNegativeIntSchema.optional(),
  categoryId: nonEmptyString.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  note: z.string().max(500).optional(),
  type: TransactionTypeSchema.optional(),
  schedule: TransactionTemplateScheduleDocSchema.nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export const TransactionTemplateInputSchema = z.object({
  id: nonEmptyString.optional(),
  name: nonEmptyString.optional(),
  amountCents: NonNegativeIntSchema.optional(),
  categoryId: nonEmptyString.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  note: z.string().max(500).optional(),
  type: TransactionTypeSchema.optional(),
  schedule: z.union([TransactionTemplateScheduleInputSchema, z.null()]).optional(),
  createdAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional(),
});

export const TransactionTemplateEntitySchema = TransactionTemplateDocSchema.extend({
  id: nonEmptyString,
});

export const UsageWeekDocSchema = z.object({
  weekKey: DateKeySchema,
  parse: NonNegativeIntSchema.optional(),
  analyze: NonNegativeIntSchema.optional(),
  updatedAt: TimestampSchema.optional(),
});

export const UsageWeekInputSchema = UsageWeekDocSchema.partial().extend({
  weekKey: DateKeySchema.optional(),
});

export const UsageWeekEntitySchema = UsageWeekDocSchema.extend({
  id: nonEmptyString,
});

export const PaymentDocSchema = z.object({
  transactionId: nonEmptyString,
  uid: nonEmptyString,
  targetPlan: z.enum(["byok", "pro"]),
  months: z.number().int().positive(),
  amountInCents: NonNegativeIntSchema,
  currency: nonEmptyString,
  reference: nonEmptyString,
  status: z.enum(["PENDING", "APPROVED", "DECLINED", "ERROR"]),
  processed: z.boolean(),
  webhookCount: NonNegativeIntSchema,
  createdAt: TimestampSchema,
  lastWebhookAt: TimestampSchema,
});

export const PaymentInputSchema = PaymentDocSchema.partial().extend({
  transactionId: nonEmptyString.optional(),
  uid: nonEmptyString.optional(),
});

export const PaymentEntitySchema = PaymentDocSchema.extend({
  id: nonEmptyString,
});

export const AdvisorChatTurnDocSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: nonEmptyString,
  at: z.number(),
});

export const AdvisorChatTurnInputSchema = AdvisorChatTurnDocSchema.partial();
export const AdvisorChatTurnEntitySchema = AdvisorChatTurnDocSchema;

export const AdvisorChatSessionDocSchema = z.object({
  createdAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional(),
  tone: AdvisorModeSchema.optional(),
  rangeFrom: DateKeySchema.optional(),
  rangeTo: DateKeySchema.optional(),
  conversationSummary: z.string().optional(),
  lastTurns: z.array(AdvisorChatTurnDocSchema).optional(),
  lastContextHash: z.string().optional(),
  messageCount: NonNegativeIntSchema.optional(),
});

export const AdvisorChatSessionInputSchema = z.object({
  id: nonEmptyString.optional(),
  createdAt: TimestampSchema.optional(),
  updatedAt: TimestampSchema.optional(),
  tone: AdvisorModeSchema.optional(),
  rangeFrom: DateKeySchema.optional(),
  rangeTo: DateKeySchema.optional(),
  conversationSummary: z.string().optional(),
  lastTurns: z.array(AdvisorChatTurnInputSchema).optional(),
  lastContextHash: z.string().optional(),
  messageCount: NonNegativeIntSchema.optional(),
});

export const AdvisorChatSessionEntitySchema = AdvisorChatSessionDocSchema.extend({
  id: nonEmptyString,
});

export type UserDoc = z.infer<typeof UserDocSchema>;
export type UserInput = z.infer<typeof UserInputSchema>;
export type UserEntity = z.infer<typeof UserEntitySchema>;

export type CategorySnapshotDoc = z.infer<typeof CategorySnapshotDocSchema>;
export type CategorySnapshotInput = z.infer<typeof CategorySnapshotInputSchema>;
export type CategorySnapshotEntity = z.infer<typeof CategorySnapshotEntitySchema>;

export type TransactionDoc = z.infer<typeof TransactionDocSchema>;
export type TransactionInput = z.infer<typeof TransactionInputSchema>;
export type TransactionEntity = z.infer<typeof TransactionEntitySchema>;

export type SystemCategoryDoc = z.infer<typeof SystemCategoryDocSchema>;
export type SystemCategoryInput = z.infer<typeof SystemCategoryInputSchema>;
export type SystemCategoryEntity = z.infer<typeof SystemCategoryEntitySchema>;

export type UserCategoryDoc = z.infer<typeof UserCategoryDocSchema>;
export type UserCategoryInput = z.infer<typeof UserCategoryInputSchema>;
export type UserCategoryEntity = z.infer<typeof UserCategoryEntitySchema>;

export type BudgetDoc = z.infer<typeof BudgetDocSchema>;
export type BudgetInput = z.infer<typeof BudgetInputSchema>;
export type BudgetEntity = z.infer<typeof BudgetEntitySchema>;

export type ObjectiveDoc = z.infer<typeof ObjectiveDocSchema>;
export type ObjectiveInput = z.infer<typeof ObjectiveInputSchema>;
export type ObjectiveEntity = z.infer<typeof ObjectiveEntitySchema>;

export type ObjectiveEntryDoc = z.infer<typeof ObjectiveEntryDocSchema>;
export type ObjectiveEntryInput = z.infer<typeof ObjectiveEntryInputSchema>;
export type ObjectiveEntryEntity = z.infer<typeof ObjectiveEntryEntitySchema>;

export type TransactionTemplateDoc = z.infer<typeof TransactionTemplateDocSchema>;
export type TransactionTemplateInput = z.infer<typeof TransactionTemplateInputSchema>;
export type TransactionTemplateEntity = z.infer<typeof TransactionTemplateEntitySchema>;

export type UsageWeekDoc = z.infer<typeof UsageWeekDocSchema>;
export type UsageWeekInput = z.infer<typeof UsageWeekInputSchema>;
export type UsageWeekEntity = z.infer<typeof UsageWeekEntitySchema>;

export type PaymentDoc = z.infer<typeof PaymentDocSchema>;
export type PaymentInput = z.infer<typeof PaymentInputSchema>;
export type PaymentEntity = z.infer<typeof PaymentEntitySchema>;

export type AdvisorChatTurnDoc = z.infer<typeof AdvisorChatTurnDocSchema>;
export type AdvisorChatTurnInput = z.infer<typeof AdvisorChatTurnInputSchema>;
export type AdvisorChatTurnEntity = z.infer<typeof AdvisorChatTurnEntitySchema>;

export type AdvisorChatSessionDoc = z.infer<typeof AdvisorChatSessionDocSchema>;
export type AdvisorChatSessionInput = z.infer<typeof AdvisorChatSessionInputSchema>;
export type AdvisorChatSessionEntity = z.infer<typeof AdvisorChatSessionEntitySchema>;

import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {HttpsError, onCall} from "firebase-functions/v2/https";

import {systemCategories} from "./data/systemCategories";

type CategoryKind = "expense" | "income";

type SystemCategoryPayload = {
  id: string;
  labelKey: string;
  icon: string;
  kind: CategoryKind;
  order: number;
  color?: string | null;
  parentId?: string | null;
};

initializeApp();

const db = getFirestore();

const requireAdmin = (auth: {token?: unknown} | undefined): void => {
  const token = auth?.token;
  const admin =
    typeof token === "object" &&
    token !== null &&
    "admin" in token &&
    (token as {admin?: unknown}).admin === true;

  if (!admin) {
    throw new HttpsError("permission-denied", "Admin permissions required.");
  }
};

const getRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null) {
    throw new HttpsError("invalid-argument", "Invalid payload.");
  }

  return value as Record<string, unknown>;
};

const getRequiredString = (value: unknown, field: string): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  throw new HttpsError("invalid-argument", `Invalid ${field}.`);
};

const getOptionalString = (
  value: unknown,
  field: string
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  throw new HttpsError("invalid-argument", `Invalid ${field}.`);
};

const getRequiredKind = (value: unknown): CategoryKind => {
  if (value === "expense" || value === "income") {
    return value;
  }

  throw new HttpsError("invalid-argument", "Invalid kind.");
};

const getRequiredOrder = (value: unknown): number => {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  throw new HttpsError("invalid-argument", "Invalid order.");
};

const parseSystemCategoryPayload = (data: unknown): SystemCategoryPayload => {
  const record = getRecord(data);

  return {
    id: getRequiredString(record.id, "id"),
    labelKey: getRequiredString(record.labelKey, "labelKey"),
    icon: getRequiredString(record.icon, "icon"),
    kind: getRequiredKind(record.kind),
    order: getRequiredOrder(record.order),
    color: getOptionalString(record.color, "color"),
    parentId: getOptionalString(record.parentId, "parentId"),
  };
};

const buildCategoryData = (
  payload: SystemCategoryPayload
): Record<string, unknown> => {
  const data: Record<string, unknown> = {
    labelKey: payload.labelKey,
    icon: payload.icon,
    kind: payload.kind,
    order: payload.order,
  };

  if (payload.color !== undefined) {
    data.color = payload.color;
  }

  if (payload.parentId !== undefined) {
    data.parentId = payload.parentId;
  }

  return data;
};

export const seedSystemCategories = onCall(async (request) => {
  requireAdmin(request.auth);

  const categoriesRef = db.collection("system_categories");
  const existingSnapshot = await categoriesRef.limit(1).get();

  if (!existingSnapshot.empty) {
    return {status: "skipped"};
  }

  const batch = db.batch();

  systemCategories.forEach((category) => {
    batch.set(categoriesRef.doc(category.id), category);
  });

  await batch.commit();

  return {status: "seeded", count: systemCategories.length};
});

export const createSystemCategory = onCall(async (request) => {
  requireAdmin(request.auth);

  const payload = parseSystemCategoryPayload(request.data);
  const docRef = db.collection("system_categories").doc(payload.id);
  const existing = await docRef.get();

  if (existing.exists) {
    throw new HttpsError("already-exists", "Category already exists.");
  }

  await docRef.set(buildCategoryData(payload));

  return {status: "created"};
});

export const updateSystemCategory = onCall(async (request) => {
  requireAdmin(request.auth);

  const payload = parseSystemCategoryPayload(request.data);
  const docRef = db.collection("system_categories").doc(payload.id);

  await docRef.update(buildCategoryData(payload));

  return {status: "updated"};
});

export const deleteSystemCategory = onCall(async (request) => {
  requireAdmin(request.auth);

  const record = getRecord(request.data);
  const id = getRequiredString(record.id, "id");

  await db.collection("system_categories").doc(id).delete();

  return {status: "deleted"};
});

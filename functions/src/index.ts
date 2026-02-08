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
  order?: number;
  color?: string | null;
  parentId?: string | null;
};

type SystemCategoryData = {
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

const isKind = (value: unknown): value is CategoryKind => {
  return value === "expense" || value === "income";
};

const getRequiredOrder = (value: unknown): number => {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  throw new HttpsError("invalid-argument", "Invalid order.");
};

const getOptionalOrder = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return getRequiredOrder(value);
};

const parseSystemCategoryPayload = (
  data: unknown,
  options?: {allowMissingOrder?: boolean}
): SystemCategoryPayload => {
  const record = getRecord(data);
  const order = options?.allowMissingOrder ?
    getOptionalOrder(record.order) :
    getRequiredOrder(record.order);

  return {
    id: getRequiredString(record.id, "id"),
    labelKey: getRequiredString(record.labelKey, "labelKey"),
    icon: getRequiredString(record.icon, "icon"),
    kind: getRequiredKind(record.kind),
    order,
    color: getOptionalString(record.color, "color"),
    parentId: getOptionalString(record.parentId, "parentId"),
  };
};

const ensureOrder = (payload: SystemCategoryPayload): SystemCategoryData => {
  if (payload.order === undefined) {
    throw new HttpsError("invalid-argument", "Invalid order.");
  }

  return {
    id: payload.id,
    labelKey: payload.labelKey,
    icon: payload.icon,
    kind: payload.kind,
    order: payload.order,
    color: payload.color,
    parentId: payload.parentId,
  };
};

const buildCategoryData = (
  payload: SystemCategoryData
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

const getNextOrder = async (kind: CategoryKind): Promise<number> => {
  const snapshot = await db
    .collection("system_categories")
    .where("kind", "==", kind)
    .orderBy("order", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const lastOrder = snapshot.docs[0]?.data().order;
  if (typeof lastOrder === "number" && Number.isInteger(lastOrder)) {
    return lastOrder + 1;
  }

  return 0;
};

const getRequiredIdList = (value: unknown): string[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpsError("invalid-argument", "Invalid orderedIds.");
  }

  const ids = value.map((entry) => getRequiredString(entry, "orderedIds"));
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    throw new HttpsError("invalid-argument", "Invalid orderedIds.");
  }

  return ids;
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
    batch.set(
      categoriesRef.doc(category.id),
      buildCategoryData({
        id: category.id,
        labelKey: category.labelKey,
        icon: category.icon,
        kind: category.kind,
        order: category.order,
        color: category.color,
        parentId: category.parentId,
      })
    );
  });

  await batch.commit();

  return {status: "seeded", count: systemCategories.length};
});

export const createSystemCategory = onCall(async (request) => {
  requireAdmin(request.auth);

  const payload = parseSystemCategoryPayload(request.data, {
    allowMissingOrder: true,
  });
  const docRef = db.collection("system_categories").doc(payload.id);
  const existing = await docRef.get();

  if (existing.exists) {
    throw new HttpsError("already-exists", "Category already exists.");
  }

  const order = payload.order ?? (await getNextOrder(payload.kind));
  const data = buildCategoryData({...payload, order});

  await docRef.set(data);

  return {status: "created"};
});

export const updateSystemCategory = onCall(async (request) => {
  requireAdmin(request.auth);

  const payload = ensureOrder(parseSystemCategoryPayload(request.data));
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

export const reorderSystemCategories = onCall(async (request) => {
  requireAdmin(request.auth);

  const record = getRecord(request.data);
  const kind = getRequiredKind(record.kind);
  const orderedIds = getRequiredIdList(record.orderedIds);
  const categoriesRef = db.collection("system_categories");
  const refs = orderedIds.map((id) => categoriesRef.doc(id));
  const snapshots = await db.getAll(...refs);

  const batch = db.batch();

  snapshots.forEach((snapshot, index) => {
    if (!snapshot.exists) {
      throw new HttpsError("not-found", "Category not found.");
    }

    const data = snapshot.data();
    if (!data || !isKind(data.kind) || data.kind !== kind) {
      throw new HttpsError("invalid-argument", "Invalid category kind.");
    }

    batch.update(snapshot.ref, {order: index});
  });

  await batch.commit();

  return {status: "reordered", count: orderedIds.length};
});

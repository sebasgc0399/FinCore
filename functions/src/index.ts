import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {HttpsError, onCall} from "firebase-functions/v2/https";

import {systemCategories} from "./data/systemCategories";

type CategoryKind = "expense" | "income";

const CATEGORY_KINDS: readonly CategoryKind[] = ["expense", "income"];
const MAX_BATCH_WRITES = 500;
const REORDER_META_WRITES = 1;
const MAX_REORDER_IDS = MAX_BATCH_WRITES - REORDER_META_WRITES;
const MAX_SEED_CATEGORY_WRITES = MAX_BATCH_WRITES - CATEGORY_KINDS.length;

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

const buildCategoryUpdateData = (
  payload: SystemCategoryPayload
): Record<string, unknown> => {
  const data: Record<string, unknown> = {
    labelKey: payload.labelKey,
    icon: payload.icon,
  };

  if (payload.color !== undefined) {
    data.color = payload.color;
  }

  if (payload.parentId !== undefined) {
    data.parentId = payload.parentId;
  }

  return data;
};

const getMetaRef = (kind: CategoryKind) => {
  return db.collection("system_categories_meta").doc(kind);
};

const getMaxOrderQuery = (kind: CategoryKind) => {
  return db
    .collection("system_categories")
    .where("kind", "==", kind)
    .orderBy("order", "desc")
    .limit(1);
};

const getValidNonNegativeInteger = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  return null;
};

const computeInitialNextOrder = async (
  transaction: FirebaseFirestore.Transaction,
  kind: CategoryKind
): Promise<number> => {
  const metaRef = getMetaRef(kind);
  const metaSnapshot = await transaction.get(metaRef);
  const metaData = metaSnapshot.data();
  const existingNextOrder = getValidNonNegativeInteger(metaData?.nextOrder);

  if (existingNextOrder !== null) {
    return existingNextOrder;
  }

  const maxOrderSnapshot = await transaction.get(getMaxOrderQuery(kind));
  const maxOrder = getValidNonNegativeInteger(
    maxOrderSnapshot.docs[0]?.data().order
  );
  const nextOrder = maxOrder === null ? 0 : maxOrder + 1;

  transaction.set(metaRef, {nextOrder}, {merge: true});
  return nextOrder;
};

const getSeedNextOrderByKind = (): Record<CategoryKind, number> => {
  const nextOrderByKind: Record<CategoryKind, number> = {
    expense: 0,
    income: 0,
  };

  systemCategories.forEach((category) => {
    const candidate = category.order + 1;
    if (candidate > nextOrderByKind[category.kind]) {
      nextOrderByKind[category.kind] = candidate;
    }
  });

  return nextOrderByKind;
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

  if (systemCategories.length > MAX_SEED_CATEGORY_WRITES) {
    throw new HttpsError(
      "failed-precondition",
      "Seed exceeds Firestore batch write limit."
    );
  }

  const batch = db.batch();
  const nextOrderByKind = getSeedNextOrderByKind();

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

  CATEGORY_KINDS.forEach((kind) => {
    batch.set(
      getMetaRef(kind),
      {nextOrder: nextOrderByKind[kind]},
      {merge: true}
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
  const createdOrder = await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(docRef);
    if (existing.exists) {
      throw new HttpsError("already-exists", "Category already exists.");
    }

    const order = await computeInitialNextOrder(transaction, payload.kind);
    const data = buildCategoryData({...payload, order});

    transaction.create(docRef, data);
    transaction.set(
      getMetaRef(payload.kind),
      {nextOrder: order + 1},
      {merge: true}
    );

    return order;
  });

  return {status: "created", order: createdOrder};
});

export const updateSystemCategory = onCall(async (request) => {
  requireAdmin(request.auth);

  const payload = parseSystemCategoryPayload(request.data, {
    allowMissingOrder: true,
  });
  const docRef = db.collection("system_categories").doc(payload.id);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      throw new HttpsError("not-found", "Category not found.");
    }

    const storedKind = getRequiredKind(snapshot.data()?.kind);
    if (storedKind !== payload.kind) {
      throw new HttpsError(
        "invalid-argument",
        "Category kind cannot be changed."
      );
    }

    transaction.update(docRef, buildCategoryUpdateData(payload));
  });

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

  if (orderedIds.length > MAX_REORDER_IDS) {
    throw new HttpsError(
      "invalid-argument",
      "Too many categories to reorder in a single request."
    );
  }

  const categoriesRef = db.collection("system_categories");
  const categoriesSnapshot = await categoriesRef
    .where("kind", "==", kind)
    .get();
  const categoryIds = categoriesSnapshot.docs.map((snapshot) => snapshot.id);
  const categoryIdSet = new Set(categoryIds);

  const missingIds = categoryIds.filter((id) => !orderedIds.includes(id));
  const extraIds = orderedIds.filter((id) => !categoryIdSet.has(id));

  if (
    missingIds.length > 0 ||
    extraIds.length > 0 ||
    orderedIds.length !== categoryIds.length
  ) {
    throw new HttpsError(
      "invalid-argument",
      "orderedIds must include all categories for this kind."
    );
  }

  const batch = db.batch();

  orderedIds.forEach((id, index) => {
    batch.update(categoriesRef.doc(id), {order: index});
  });
  batch.set(getMetaRef(kind), {nextOrder: orderedIds.length}, {merge: true});

  await batch.commit();

  return {status: "reordered", count: orderedIds.length};
});

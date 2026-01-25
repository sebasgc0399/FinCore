import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { HttpsError, onCall } from "firebase-functions/v2/https"

import { systemCategories } from "./data/systemCategories"

initializeApp()

const db = getFirestore()

export const seedSystemCategories = onCall(async (request) => {
  if (request.auth?.token?.admin !== true) {
    throw new HttpsError("permission-denied", "Admin permissions required.")
  }

  const categoriesRef = db.collection("system_categories")
  const existingSnapshot = await categoriesRef.limit(1).get()

  if (!existingSnapshot.empty) {
    return { status: "skipped" }
  }

  const batch = db.batch()

  systemCategories.forEach((category) => {
    batch.set(categoriesRef.doc(category.id), category)
  })

  await batch.commit()

  return { status: "seeded", count: systemCategories.length }
})

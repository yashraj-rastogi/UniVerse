import { doc, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./config"

export type TransactionType = "Earned" | "Spent"

export interface PointTransaction {
  type: TransactionType
  amount: number
  source: string
  timestamp: any
}

export async function addPoints(userId: string, amount: number, source: string) {
  const userRef = doc(db, "users", userId)
  const historyRef = collection(userRef, "pointHistory")

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw "User does not exist!"
      }

      const currentPoints = userDoc.data().currentPoints || 0
      const lifetimePoints = userDoc.data().lifetimePoints || 0

      const newCurrentPoints = currentPoints + amount
      const newLifetimePoints = lifetimePoints + amount

      transaction.update(userRef, {
        currentPoints: newCurrentPoints,
        lifetimePoints: newLifetimePoints,
        updatedAt: new Date().toISOString()
      })

      // We can't add to a subcollection in a transaction directly like this if we want the ID to be auto-generated easily within the transaction object's set method without a ref. 
      // But we can create a ref first.
      const newHistoryRef = doc(historyRef)
      transaction.set(newHistoryRef, {
        type: "Earned",
        amount: amount,
        source: source,
        timestamp: serverTimestamp()
      })
    })
    console.log("Points added successfully")
  } catch (e) {
    console.error("Transaction failed: ", e)
    throw e
  }
}

export async function spendPoints(userId: string, amount: number, source: string) {
  const userRef = doc(db, "users", userId)
  const historyRef = collection(userRef, "pointHistory")

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw "User does not exist!"
      }

      const currentPoints = userDoc.data().currentPoints || 0

      if (currentPoints < amount) {
        throw "Insufficient points!"
      }

      const newCurrentPoints = currentPoints - amount

      transaction.update(userRef, {
        currentPoints: newCurrentPoints,
        updatedAt: new Date().toISOString()
      })

      const newHistoryRef = doc(historyRef)
      transaction.set(newHistoryRef, {
        type: "Spent",
        amount: amount,
        source: source,
        timestamp: serverTimestamp()
      })
    })
    console.log("Points spent successfully")
  } catch (e) {
    console.error("Transaction failed: ", e)
    throw e
  }
}

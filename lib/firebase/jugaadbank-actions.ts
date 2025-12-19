
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "./config"
import { addPoints, spendPoints } from "./wallet"
import type { Listing } from "./jugaadbank"

export async function borrowItem(listingId: string, borrowerUid: string) {
  const listingRef = doc(db, "listings", listingId)
  const listingSnap = await getDoc(listingRef)
  
  if (!listingSnap.exists()) {
    throw new Error("Listing not found")
  }
  
  const listing = listingSnap.data() as Listing
  
  if (listing.status !== "available") {
    throw new Error("Item is not available")
  }
  
  if (listing.ownerUid === borrowerUid) {
    throw new Error("You cannot borrow your own item")
  }
  
  // Deduct points from borrower
  await spendPoints(borrowerUid, listing.lendingPrice, `Borrowed: ${listing.itemName}`)
  
  // Update listing status
  await updateDoc(listingRef, {
    status: "borrowed",
    borrowerUid: borrowerUid
  })
}

export async function returnItem(listingId: string) {
  const listingRef = doc(db, "listings", listingId)
  const listingSnap = await getDoc(listingRef)
  
  if (!listingSnap.exists()) {
    throw new Error("Listing not found")
  }
  
  const listing = listingSnap.data() as Listing
  
  if (listing.status !== "borrowed") {
    throw new Error("Item is not borrowed")
  }
  
  // Add points to owner
  await addPoints(listing.ownerUid, listing.lendingPrice, `Item Returned: ${listing.itemName}`)
  
  // Update listing status
  await updateDoc(listingRef, {
    status: "available",
    borrowerUid: null
  })
}

import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "./config"
import { addPoints, spendPoints } from "./wallet"

// Listing interface
export interface Listing {
  id?: string
  itemName: string
  description: string
  lendingPrice: number
  ownerUid: string
  ownerEmail: string
  ownerRollNumber: string
  createdAt: string
  status: "available" | "borrowed" | "unavailable"
  category?: string
  borrowerUid?: string
}

// Request interface for items students are looking for
export interface Request {
  id?: string
  itemName: string
  description: string
  offeringPrice: number
  requesterUid: string
  requesterEmail: string
  requesterRollNumber: string
  createdAt: string
  status: "active" | "fulfilled" | "cancelled"
  category?: string
}

// Create a new listing
export async function createListing(
  itemName: string,
  description: string,
  lendingPrice: number,
  ownerUid: string,
  ownerEmail: string,
  ownerRollNumber: string,
  category?: string,
): Promise<string> {
  if (!itemName || itemName.trim().length === 0) {
    throw new Error("Item name is required")
  }

  if (!description || description.trim().length === 0) {
    throw new Error("Description is required")
  }

  if (lendingPrice < 0) {
    throw new Error("Lending price must be 0 or greater")
  }

  const listing: Omit<Listing, "id"> = {
    itemName: itemName.trim(),
    description: description.trim(),
    lendingPrice,
    ownerUid,
    ownerEmail,
    ownerRollNumber,
    createdAt: new Date().toISOString(),
    status: "available",
    category: category || "Other",
  }

  const docRef = await addDoc(collection(db, "listings"), listing)
  return docRef.id
}

// Get all listings (available and borrowed)
export async function getAllListings(): Promise<Listing[]> {
  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  const listings: Listing[] = []

  querySnapshot.forEach((doc) => {
    listings.push({
      id: doc.id,
      ...doc.data(),
    } as Listing)
  })

  return listings
}

// Get all available listings
export async function getAvailableListings(): Promise<Listing[]> {
  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  const listings: Listing[] = []

  querySnapshot.forEach((doc) => {
    const data = doc.data()
    // Filter for available status on client side
    if (data.status === "available") {
      listings.push({
        id: doc.id,
        ...data,
      } as Listing)
    }
  })

  return listings
}

// Get user's listings
export async function getUserListings(uid: string): Promise<Listing[]> {
  const q = query(collection(db, "listings"), where("ownerUid", "==", uid), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  const listings: Listing[] = []

  querySnapshot.forEach((doc) => {
    listings.push({
      id: doc.id,
      ...doc.data(),
    } as Listing)
  })

  return listings
}

export async function createRequest(
  itemName: string,
  description: string,
  offeringPrice: number,
  requesterUid: string,
  requesterEmail: string,
  requesterRollNumber: string,
  category?: string,
): Promise<string> {
  if (!itemName || itemName.trim().length === 0) {
    throw new Error("Item name is required")
  }

  if (!description || description.trim().length === 0) {
    throw new Error("Description is required")
  }

  if (offeringPrice < 0) {
    throw new Error("Offering price must be 0 or greater")
  }

  const request: Omit<Request, "id"> = {
    itemName: itemName.trim(),
    description: description.trim(),
    offeringPrice,
    requesterUid,
    requesterEmail,
    requesterRollNumber,
    createdAt: new Date().toISOString(),
    status: "active",
    category: category || "Other",
  }

  const docRef = await addDoc(collection(db, "requests"), request)
  return docRef.id
}

export async function getActiveRequests(): Promise<Request[]> {
  const q = query(collection(db, "requests"), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  const requests: Request[] = []

  querySnapshot.forEach((doc) => {
    const data = doc.data()
    // Filter for active status on client side
    if (data.status === "active") {
      requests.push({
        id: doc.id,
        ...data,
      } as Request)
    }
  })

  return requests
}

export async function getUserRequests(uid: string): Promise<Request[]> {
  const q = query(collection(db, "requests"), where("requesterUid", "==", uid), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  const requests: Request[] = []

  querySnapshot.forEach((doc) => {
    requests.push({
      id: doc.id,
      ...doc.data(),
    } as Request)
  })

  return requests
}

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./config"

// Email validation function - strictly restricts to .edu domains
export function validateStudentEmail(email: string): boolean {
  const eduRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.edu$/i
  return eduRegex.test(email)
}

// User profile interface
export interface UserProfile {
  uid: string
  email: string
  rollNumber: string
  createdAt: string
  updatedAt: string
}

// Create user profile in Firestore
export async function createUserProfile(uid: string, email: string, rollNumber: string): Promise<void> {
  const userRef = doc(db, "users", uid)
  const profile: UserProfile = {
    uid,
    email,
    rollNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await setDoc(userRef, profile)
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid)
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

// Sign up with email validation
export async function signUp(email: string, password: string, rollNumber: string) {
  console.log("[v0] Starting sign up process", { email, rollNumber })

  // Validate email is .edu
  if (!validateStudentEmail(email)) {
    console.log("[v0] Email validation failed", { email })
    throw new Error("Only .edu email addresses are allowed. Please use your college email.")
  }

  // Validate roll number
  if (!rollNumber || rollNumber.trim().length === 0) {
    console.log("[v0] Roll number validation failed")
    throw new Error("Roll number is required.")
  }

  console.log("[v0] Creating user in Firebase Auth")
  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  console.log("[v0] User created in Auth", { uid: userCredential.user.uid })

  console.log("[v0] Creating user profile in Firestore")
  // Create user profile in Firestore
  await createUserProfile(userCredential.user.uid, email, rollNumber.trim())
  console.log("[v0] User profile created successfully")

  return userCredential.user
}

// Sign in
export async function signIn(email: string, password: string) {
  console.log("[v0] Starting sign in process", { email })

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("[v0] Sign in successful", { uid: userCredential.user.uid })
    return userCredential
  } catch (error: any) {
    console.log("[v0] Sign in failed", { error: error.message, code: error.code })
    throw error
  }
}

// Sign out
export async function signOut() {
  console.log("[v0] Signing out")
  return await firebaseSignOut(auth)
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    console.log("[v0] Auth state changed", { user: user ? { uid: user.uid, email: user.email } : null })
    callback(user)
  })
}

"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/components/auth/auth-provider"

export function useWallet() {
  const { user } = useAuth()
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [lifetimePoints, setLifetimePoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const userRef = doc(db, "users", user.uid)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setCurrentPoints(data.currentPoints || 0)
        setLifetimePoints(data.lifetimePoints || 0)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return { currentPoints, lifetimePoints, loading }
}

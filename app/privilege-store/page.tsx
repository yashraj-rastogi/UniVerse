"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useWallet } from "@/hooks/use-wallet"
import { PrivilegeStore } from "@/components/dashboard/privilege-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function PrivilegeStorePage() {
  const { user, loading: authLoading } = useAuth()
  const { currentPoints, loading: walletLoading } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  if (authLoading || walletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="w-full px-4 py-6 md:px-8 border-b bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Privilege Store</h1>
          </div>
          <div className="ml-auto font-mono font-bold text-lg">
            {currentPoints} pts
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Redeem Perks</h2>
            <p className="text-muted-foreground">
              Use your hard-earned attendance points for exclusive campus privileges.
            </p>
          </div>
          
          <PrivilegeStore userId={user.uid} currentPoints={currentPoints} />
        </div>
      </main>
    </div>
  )
}

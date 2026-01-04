"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserProfile, signOut, type UserProfile } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, LogOut, User, Mail, Award as IdCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RedeemedCoupons } from "@/components/dashboard/redeemed-coupons"
import { BorrowedItems } from "@/components/dashboard/borrowed-items"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ModeToggle } from "@/components/mode-toggle"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid)
          setProfile(userProfile)
        } catch (error) {
          console.error("Error loading profile:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfile()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      })
      router.push("/auth")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background pb-24">
      {/* Header */}
      <header className="w-full px-4 py-6 md:px-8 border-b bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <User className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold">My Profile</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="h-full border-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>{profile.role === 'teacher' ? 'Teacher Information' : 'Student Information'}</CardTitle>
              <CardDescription>Verified {profile.role === 'teacher' ? 'teacher' : 'student'} details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{profile.role === 'teacher' ? 'Email' : 'Student Email'}</p>
                    <p className="text-base font-semibold mt-1 break-all">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <IdCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{profile.role === 'teacher' ? 'Employee ID' : 'Roll Number'}</p>
                    <p className="text-base font-semibold mt-1">{profile.rollNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-base font-mono text-sm mt-1">{profile.uid.slice(0, 12)}...</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-base font-semibold mt-1 text-accent">Verified {profile.role === 'teacher' ? 'Teacher' : 'Student'}</p>
                  </div>
                </div>
              </div>
              
              {profile.role !== 'teacher' && (
                <>
                  <RedeemedCoupons userId={user.uid} />
                  <BorrowedItems userId={user.uid} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

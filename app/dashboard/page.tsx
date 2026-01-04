"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserProfile, signOut, type UserProfile } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Shield, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ClassMeter } from "@/components/dashboard/class-meter"
import { AttendanceMarker } from "@/components/dashboard/attendance-marker"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { PrivilegeStore } from "@/components/dashboard/privilege-store"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useWallet } from "@/hooks/use-wallet"
import { ModeToggle } from "@/components/mode-toggle"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentPoints } = useWallet()
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="w-full px-4 py-6 md:px-8 border-b bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold">UniVerse</span>
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
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {profile.role === "teacher" ? (
          <TeacherDashboard />
        ) : (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">Welcome to UniVerse</h1>
              <p className="text-lg text-muted-foreground">Your verified student community dashboard</p>
            </div>

            {/* Attendance Meter */}
            <div className="w-full space-y-6">
              <ClassMeter userId={user.uid} points={currentPoints} />
              <AttendanceMarker userProfile={profile} />
            </div>

            {/* Privilege Store Section */}
            <PrivilegeStore userId={user.uid} currentPoints={currentPoints} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

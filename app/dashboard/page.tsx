"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserProfile, signOut, type UserProfile } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, LogOut, User, Mail, Award as IdCard, Recycle, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function DashboardPage() {
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
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Welcome to UniVerse</h1>
            <p className="text-lg text-muted-foreground">Your verified student community dashboard</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Verified student information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student Email</p>
                    <p className="text-base font-semibold mt-1">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <IdCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
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
                    <p className="text-base font-semibold mt-1 text-accent">Verified Student</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2 border-accent/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Recycle className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">JugaadBank</CardTitle>
                </div>
                <CardDescription>Lend & borrow student items with points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share calculators, lab coats, textbooks & more. Reduce waste, save money.
                </p>
                <Button asChild className="w-full">
                  <Link href="/jugaadbank">Open JugaadBank</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">My Chats</CardTitle>
                </div>
                <CardDescription>View all your conversations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage conversations with lenders and requesters from JugaadBank.
                </p>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/chats">View Chats</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Groups</CardTitle>
                <CardDescription>Connect with peers for collaborative learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Coming Soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opportunities</CardTitle>
                <CardDescription>Internships, events, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Coming Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

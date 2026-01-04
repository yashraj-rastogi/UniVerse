"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { markAttendance } from "@/lib/firebase/attendance"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"
import { UserProfile } from "@/lib/firebase/auth"

interface AttendanceMarkerProps {
  userProfile: UserProfile
}

export function AttendanceMarker({ userProfile }: AttendanceMarkerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !code) return

    setLoading(true)
    try {
      const result = await markAttendance(user.uid, userProfile.email, userProfile.rollNumber, code.toUpperCase())
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })
        setCode("")
      } else {
        toast({
          title: "Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error marking attendance:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Enter the code provided by your teacher.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMarkAttendance} className="flex space-x-2">
          <Input
            placeholder="Enter Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="uppercase font-mono"
          />
          <Button type="submit" disabled={loading || !code}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

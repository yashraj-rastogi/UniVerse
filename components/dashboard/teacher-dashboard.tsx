"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createAttendanceSession, getTeacherSessions, getSessionAttendance, type AttendanceSession, type AttendanceRecord } from "@/lib/firebase/attendance"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Clock, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TeacherDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    if (user) {
      loadSessions()
    }
  }, [user])

  const loadSessions = async () => {
    if (!user) return
    setLoadingSessions(true)
    try {
      const data = await getTeacherSessions(user.uid)
      setSessions(data)
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load past sessions.",
        variant: "destructive",
      })
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
    } else if (timeLeft === 0) {
      setCode(null)
      setTimeLeft(null)
    }
    return () => clearInterval(interval)
  }, [timeLeft])

  const handleGenerateCode = async () => {
    if (!user) return
    setLoading(true)
    try {
      const newCode = await createAttendanceSession(user.uid)
      setCode(newCode)
      setTimeLeft(300) // 5 minutes in seconds
      toast({
        title: "Code Generated",
        description: "Share this code with your students. It expires in 5 minutes.",
      })
      loadSessions() // Refresh list
    } catch (error) {
      console.error("Error generating code:", error)
      toast({
        title: "Error",
        description: "Failed to generate attendance code.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewAttendance = async (session: AttendanceSession) => {
    setSelectedSession(session)
    setLoadingRecords(true)
    try {
      if (session.id) {
        const records = await getSessionAttendance(session.id)
        setAttendanceRecords(records)
      }
    } catch (error) {
      console.error("Error loading attendance:", error)
    } finally {
      setLoadingRecords(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Active Session</CardTitle>
          <CardDescription>Generate a unique code for students to mark their attendance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-10">
          {code ? (
            <div className="text-center space-y-4">
              <div className="text-6xl font-mono font-bold tracking-wider bg-muted p-6 rounded-lg border-2 border-primary">
                {code}
              </div>
              <div className="flex items-center justify-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Expires in {timeLeft !== null ? formatTime(timeLeft) : "0:00"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This code is valid for 5 minutes only.
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No active session. Click the button below to start one.
            </div>
          )}
          
          <Button 
            size="lg" 
            onClick={handleGenerateCode} 
            disabled={loading || (timeLeft !== null && timeLeft > 0)}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : code ? (
              "Generate New Code"
            ) : (
              "Generate Attendance Code"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Past Sessions</h2>
        {loadingSessions ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground">No past sessions found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{session.code}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleViewAttendance(session)}>
                        <Users className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Attendance for {session.code}</DialogTitle>
                        <DialogDescription>
                          {session.createdAt?.toDate().toLocaleString()}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        {loadingRecords ? (
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : attendanceRecords.length > 0 ? (
                          <div className="space-y-4">
                            {attendanceRecords.map((record, index) => (
                              <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div>
                                  <p className="font-medium">{record.studentRollNumber || record.studentId}</p>
                                  <p className="text-xs text-muted-foreground">{record.studentEmail}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {record.markedAt?.toDate().toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Present
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground">No attendance records found.</p>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  {session.createdAt?.toDate().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {session.createdAt?.toDate().toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  )
}

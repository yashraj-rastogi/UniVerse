"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle2, Loader2, Info } from "lucide-react"
import { addPoints } from "@/lib/firebase/wallet"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ClassMeterProps {
  userId: string
  points: number
}

export function ClassMeter({ userId, points }: ClassMeterProps) {
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { toast } = useToast()

  // Check for existing cooldown on mount
  useEffect(() => {
    const lastCheckIn = localStorage.getItem(`lastCheckIn_${userId}`)
    if (lastCheckIn) {
      const timePassed = Date.now() - parseInt(lastCheckIn)
      const oneHour = 60 * 60 * 1000
      if (timePassed < oneHour) {
        setCooldown(Math.ceil((oneHour - timePassed) / 1000 / 60)) // Minutes remaining
      }
    }
  }, [userId])

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await addPoints(userId, 50, "Class Check-In")
      
      // Set cooldown
      localStorage.setItem(`lastCheckIn_${userId}`, Date.now().toString())
      setCooldown(60) // 60 minutes

      toast({
        title: "Checked In!",
        description: "You earned 50 points for attending class.",
      })
    } catch (error) {
      console.error("Error adding points:", error)
      toast({
        title: "Error",
        description: "Failed to check in.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Circular Progress Component
  const CircularProgress = ({ value }: { value: number }) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const progress = value / 100
    const dashoffset = circumference * (1 - progress)

    return (
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className="text-primary transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-2xl font-bold">{value}%</span>
          <p className="text-[10px] text-muted-foreground uppercase">Attendance</p>
        </div>
      </div>
    )
  }

  // Mock attendance percentage (could be calculated from points or real data later)
  // For now, let's just make it look dynamic based on points, capped at 100
  const attendancePercentage = Math.min(Math.floor((points / 500) * 100), 100)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">Class Meter</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Convert attendance minutes into canteen credits or privileges.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Zap className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <CircularProgress value={attendancePercentage} />
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold">{points}</div>
          <p className="text-xs text-muted-foreground">
            Total Accumulated Points
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleCheckIn}
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : cooldown > 0 ? (
            `Next check-in in ${cooldown}m`
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Check In to Class (+50)
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

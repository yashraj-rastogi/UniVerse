"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Zap, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getStudentWeeklyAttendance } from "@/lib/firebase/attendance"

interface ClassMeterProps {
  userId: string
  points: number
}

export function ClassMeter({ userId, points }: ClassMeterProps) {
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAttendance() {
      if (userId) {
        try {
          const records = await getStudentWeeklyAttendance(userId)
          const counts = [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
          
          records.forEach(record => {
            const date = record.markedAt.toDate()
            let day = date.getDay() // 0=Sun, 1=Mon...
            // Convert to 0=Mon, 6=Sun
            day = day === 0 ? 6 : day - 1
            counts[day]++
          })
          setWeeklyData(counts)
        } catch (error) {
          console.error("Error loading attendance:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadAttendance()
  }, [userId])

  const maxVal = 6
  const limit = 5

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
                <p>Track your daily class attendance. Limit is 5 classes per day.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Zap className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent className="py-6">
        <div className="w-full h-48 relative mt-2">
          {/* Limit Line */}
          <div 
            className="absolute w-full border-t border-dashed border-muted-foreground/50 z-0"
            style={{ bottom: `${(limit / maxVal) * 100}%` }}
          >
            <span className="absolute -top-2.5 left-0 text-[10px] text-muted-foreground bg-card pr-1">Daily Limit</span>
            <span className="absolute -top-2.5 right-0 text-[10px] text-muted-foreground bg-card pl-1">{limit}</span>
          </div>

          <div className="flex items-end justify-between h-full gap-2 pt-4 relative z-10">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
              const count = weeklyData[index]
              const height = (Math.min(count, maxVal) / maxVal) * 100
              
              return (
                <div key={day} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="relative w-full flex flex-col justify-end items-center h-full">
                     <span className="mb-1 text-xs font-medium">{count}</span>
                     <div 
                       className="w-full max-w-[30px] bg-primary rounded-t-sm transition-all duration-500 ease-out hover:opacity-80"
                       style={{ height: `${height}%` }}
                     />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">{day}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-2xl font-bold">{points}</div>
          <p className="text-xs text-muted-foreground">
            Total Accumulated Points
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-xs text-muted-foreground">
        Attend classes to earn more points!
      </CardFooter>
    </Card>
  )
}

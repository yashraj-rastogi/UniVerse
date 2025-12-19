"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { spendPoints } from "@/lib/firebase/wallet"
import { Loader2, ShoppingBag, QrCode, Ticket } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PrivilegeStoreProps {
  userId: string
  currentPoints: number
}

interface Perk {
  id: string
  name: string
  description: string
  cost: number
  type: "ticket" | "credit"
}

const PERKS: Perk[] = [
  {
    id: "lunch-skip",
    name: "Lunch Queue Skip",
    description: "Priority Pass: Skip the long line at the cafeteria.",
    cost: 500,
    type: "ticket",
  },
  {
    id: "jugaad-credits",
    name: "Borrowing Subsidy",
    description: "Jugaad Bank Credits: Voucher to lower borrowing costs.",
    cost: 200,
    type: "credit",
  },
]

export function PrivilegeStore({ userId, currentPoints }: PrivilegeStoreProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTicket, setActiveTicket] = useState<Perk | null>(null)
  const { toast } = useToast()

  const handleRedeem = async (perk: Perk) => {
    if (currentPoints < perk.cost) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${perk.cost} points to redeem this perk.`,
        variant: "destructive",
      })
      return
    }

    setLoading(perk.id)
    try {
      await spendPoints(userId, perk.cost, `Redeemed: ${perk.name}`)
      
      if (perk.type === "ticket") {
        setActiveTicket(perk)
      } else {
        toast({
          title: "Redemption Successful",
          description: `You have received ${perk.name}.`,
        })
      }
    } catch (error) {
      console.error("Error redeeming perk:", error)
      toast({
        title: "Redemption Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Privilege Store
          </CardTitle>
          <CardDescription>Redeem your attendance points for exclusive perks.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((perk) => (
            <Card key={perk.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{perk.name}</CardTitle>
                  <Badge variant={currentPoints >= perk.cost ? "default" : "secondary"} className="ml-2 shrink-0">
                    {perk.cost} pts
                  </Badge>
                </div>
                <CardDescription className="text-xs">{perk.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full" 
                  size="sm" 
                  onClick={() => handleRedeem(perk)}
                  disabled={currentPoints < perk.cost || loading === perk.id}
                  variant={currentPoints < perk.cost ? "outline" : "default"}
                >
                  {loading === perk.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeeming...
                    </>
                  ) : (
                    "Redeem"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      <TicketDialog 
        open={!!activeTicket} 
        onOpenChange={(open) => !open && setActiveTicket(null)}
        ticket={activeTicket}
      />
    </>
  )
}

function TicketDialog({ open, onOpenChange, ticket }: { open: boolean; onOpenChange: (open: boolean) => void; ticket: Perk | null }) {
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes

  useEffect(() => {
    if (!open) {
      setTimeLeft(15 * 60)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Digital Ticket
          </DialogTitle>
          <DialogDescription>
            Show this QR code to the cafeteria staff.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            {/* Using a public API for QR code generation for demonstration */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.id}-${Date.now()}`} 
              alt="Ticket QR Code" 
              className="w-48 h-48"
            />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{ticket.name}</h3>
            <p className="text-sm text-muted-foreground">Valid for 15 minutes</p>
          </div>
          <div className="text-3xl font-mono font-bold text-primary">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { spendPoints } from "@/lib/firebase/wallet"
import { Loader2, ShoppingBag, QrCode, Ticket, PartyPopper, Sparkles } from "lucide-react"
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

// Confetti utility
const triggerConfetti = () => {
  if (typeof window !== 'undefined' && (window as any).confetti) {
    const confetti = (window as any).confetti
    const count = 200
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 }
    function fire(particleRatio: number, opts: any) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
    }
    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }
}

export function PrivilegeStore({ userId, currentPoints }: PrivilegeStoreProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTicket, setActiveTicket] = useState<Perk | null>(null)
  const [redeemingPerkId, setRedeemingPerkId] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  // Load confetti script
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).confetti) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

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
    setRedeemingPerkId(perk.id)
    
    try {
      await spendPoints(userId, perk.cost, `Redeemed: ${perk.name}`)
      
      setShowSuccess(true)
      setTimeout(() => triggerConfetti(), 100)

      // Save to local storage for "My Coupons" feature
      const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const redeemedItem = {
        id: perk.id,
        name: perk.name,
        description: perk.description,
        redeemedAt: Date.now(),
        expiresAt: perk.type === 'ticket' ? Date.now() + (15 * 60 * 1000) : Date.now() + (30 * 24 * 60 * 60 * 1000), // 15 mins for tickets, 30 days for others
        ticketId: ticketId,
        type: perk.type
      }
      
      const stored = localStorage.getItem(`universe_redeemed_coupons_${userId}`)
      const coupons = stored ? JSON.parse(stored) : []
      coupons.push(redeemedItem)
      localStorage.setItem(`universe_redeemed_coupons_${userId}`, JSON.stringify(coupons))
      
      // Dispatch event to update UI immediately
      window.dispatchEvent(new Event('coupon-redeemed'))
      
      setTimeout(() => {
        setShowSuccess(false)
        if (perk.type === "ticket") {
          setActiveTicket(perk)
        } else {
          toast({
            title: "🎉 Redemption Successful!",
            description: `You have received ${perk.name}.`,
          })
        }
        setRedeemingPerkId(null)
      }, 1500)
    } catch (error) {
      console.error("Error redeeming perk:", error)
      toast({
        title: "Redemption Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setRedeemingPerkId(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Card className="col-span-1 md:col-span-2 border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            Privilege Store
          </CardTitle>
          <CardDescription>Redeem your attendance points for exclusive perks.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((perk) => {
            const isRedeeming = redeemingPerkId === perk.id
            const canAfford = currentPoints >= perk.cost
            
            return (
              <Card 
                key={perk.id} 
                className={`flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                  canAfford ? 'hover:shadow-lg hover:border-primary/30' : 'opacity-75'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{perk.name}</CardTitle>
                    <Badge 
                      variant={canAfford ? "default" : "secondary"} 
                      className={`ml-2 shrink-0 ${canAfford ? 'bg-gradient-to-r from-primary to-blue-600' : ''}`}
                    >
                      {perk.cost} pts
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{perk.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    className={`w-full transition-all duration-300 ${
                      isRedeeming && showSuccess 
                        ? 'bg-green-500 hover:bg-green-500' 
                        : canAfford 
                          ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90' 
                          : ''
                    }`}
                    size="sm" 
                    onClick={() => handleRedeem(perk)}
                    disabled={!canAfford || loading === perk.id}
                    variant={canAfford ? "default" : "outline"}
                  >
                    {loading === perk.id ? (
                      isRedeeming && showSuccess ? (
                        <span className="flex items-center gap-2 animate-bounce">
                          <PartyPopper className="h-4 w-4" />
                          Ticket Generated!
                        </span>
                      ) : (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redeeming...
                        </>
                      )
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Redeem
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
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

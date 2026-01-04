"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, QrCode, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface RedeemedItem {
  id: string
  name: string
  description: string
  redeemedAt: number
  expiresAt: number
  ticketId: string
  type?: 'ticket' | 'credit'
}

export function RedeemedCoupons({ userId }: { userId: string }) {
  const [coupons, setCoupons] = useState<RedeemedItem[]>([])

  useEffect(() => {
    const loadCoupons = () => {
      const stored = localStorage.getItem(`universe_redeemed_coupons_${userId}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Sort by redemption time, newest first
          parsed.sort((a: RedeemedItem, b: RedeemedItem) => b.redeemedAt - a.redeemedAt)
          setCoupons(parsed)
        } catch (e) {
          console.error("Failed to parse coupons", e)
        }
      }
    }

    loadCoupons()
    // Listen for storage events to update in real-time
    window.addEventListener('storage', loadCoupons)
    // Custom event for same-window updates
    window.addEventListener('coupon-redeemed', loadCoupons)
    
    return () => {
      window.removeEventListener('storage', loadCoupons)
      window.removeEventListener('coupon-redeemed', loadCoupons)
    }
  }, [userId])

  if (coupons.length === 0) return null

  return (
    <Card className="mt-6 border-dashed border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">My Coupons</CardTitle>
        </div>
        <CardDescription>Your redeemed coupons history</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {coupons.map((coupon) => (
          <CouponDialog key={coupon.ticketId} coupon={coupon} />
        ))}
      </CardContent>
    </Card>
  )
}

function CouponDialog({ coupon }: { coupon: RedeemedItem }) {
  const isExpired = Date.now() > coupon.expiresAt
  const timeLeftMinutes = Math.max(0, Math.ceil((coupon.expiresAt - Date.now()) / 1000 / 60))
  
  let timeDisplay = `${timeLeftMinutes}m`
  if (timeLeftMinutes > 60 * 24) {
     timeDisplay = `${Math.ceil(timeLeftMinutes / (60 * 24))} days`
  } else if (timeLeftMinutes > 60) {
     timeDisplay = `${Math.ceil(timeLeftMinutes / 60)} hours`
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={`h-auto py-3 px-4 flex items-center justify-between w-full group hover:border-primary/50 transition-all ${isExpired ? 'opacity-60' : ''}`}>
          <div className="flex items-center gap-3 text-left">
            <div className={`bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors ${isExpired ? 'grayscale' : ''}`}>
              {coupon.type === 'credit' ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <QrCode className="h-5 w-5 text-primary" />}
            </div>
            <div>
              <p className="font-semibold text-sm">{coupon.name}</p>
              <p className="text-xs text-muted-foreground">{isExpired ? 'Expired' : `Expires in ${timeDisplay}`}</p>
            </div>
          </div>
          <Ticket className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className={`h-5 w-5 ${isExpired ? 'text-muted-foreground' : 'text-primary'}`} />
            {coupon.name}
          </DialogTitle>
          <DialogDescription>
            {isExpired ? 'This item has expired.' : (coupon.type === 'credit' ? 'This credit is active on your account.' : 'Show this QR code to the staff.')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="relative">
            <div className={`absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur-lg opacity-75 ${!isExpired && 'animate-pulse'}`} />
            <div className="relative bg-white p-4 rounded-xl shadow-sm border-2 border-dashed border-gray-200">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${coupon.ticketId}&color=${isExpired ? '888888' : '000000'}`} 
                alt="Ticket QR Code" 
                className={`w-48 h-48 ${isExpired ? 'opacity-50' : ''}`}
              />
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">ID</p>
            <p className="font-mono text-lg font-bold tracking-wider">{coupon.ticketId.split('-').slice(-1)[0]}</p>
          </div>

          <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${isExpired ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            <CheckCircle2 className="h-4 w-4" />
            {isExpired ? 'Expired' : `Valid for ${timeDisplay}`}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

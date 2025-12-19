"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/lib/firebase/jugaadbank"
import { borrowItem, returnItem } from "@/lib/firebase/jugaadbank-actions"
import { useToast } from "@/hooks/use-toast"
import { Calculator, Layout as LabCoat, Book, Wrench, Dumbbell, Music, Package, Loader2 } from "lucide-react"

interface ListingCardProps {
  listing: Listing
  currentUserId?: string
  onContact?: (listing: Listing) => void
  onActionComplete?: () => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Scientific Calculator": <Calculator className="h-5 w-5" />,
  "Lab Coat": <LabCoat className="h-5 w-5" />,
  Textbooks: <Book className="h-5 w-5" />,
  "Lab Equipment": <Wrench className="h-5 w-5" />,
  "Engineering Tools": <Wrench className="h-5 w-5" />,
  "Sports Equipment": <Dumbbell className="h-5 w-5" />,
  "Musical Instruments": <Music className="h-5 w-5" />,
  Other: <Package className="h-5 w-5" />,
}

export function ListingCard({ listing, currentUserId, onContact, onActionComplete }: ListingCardProps) {
  const icon = categoryIcons[listing.category || "Other"]
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const isOwner = currentUserId === listing.ownerUid
  const isBorrowed = listing.status === "borrowed"
  const isAvailable = listing.status === "available"

  const handleBorrow = async () => {
    if (!currentUserId) return
    setLoading(true)
    try {
      await borrowItem(listing.id!, currentUserId)
      toast({ title: "Item Borrowed", description: "Points deducted from your wallet." })
      onActionComplete?.()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    setLoading(true)
    try {
      await returnItem(listing.id!)
      toast({ title: "Item Returned", description: "Points added to your wallet." })
      onActionComplete?.()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-accent/10 p-2 rounded-lg shrink-0">{icon}</div>
            <CardTitle className="text-lg line-clamp-2">{listing.itemName}</CardTitle>
          </div>
          <Badge variant={isBorrowed ? "destructive" : "secondary"} className="shrink-0">
            {isBorrowed ? "Borrowed" : `${listing.lendingPrice} pts`}
          </Badge>
        </div>
        <CardDescription className="text-xs">Listed by Roll #{listing.ownerRollNumber}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{listing.description}</p>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {listing.category}
            </Badge>
            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
          
          {currentUserId && (
            <div className="pt-2">
              {isOwner && isBorrowed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleReturn}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Mark Returned (+{listing.lendingPrice} pts)
                </Button>
              )}
              
              {!isOwner && isAvailable && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleBorrow}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Borrow for {listing.lendingPrice} pts
                </Button>
              )}

              {!isOwner && isBorrowed && (
                 <Button variant="secondary" size="sm" className="w-full" disabled>
                   Unavailable
                 </Button>
              )}
              
              {isOwner && isAvailable && (
                 <Button variant="secondary" size="sm" className="w-full" disabled>
                   Your Listing
                 </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

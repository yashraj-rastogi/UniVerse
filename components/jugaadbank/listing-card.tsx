"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/lib/firebase/jugaadbank"
import { Calculator, Layout as LabCoat, Book, Wrench, Dumbbell, Music, Package } from "lucide-react"

interface ListingCardProps {
  listing: Listing
  onContact?: (listing: Listing) => void
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

export function ListingCard({ listing, onContact }: ListingCardProps) {
  const icon = categoryIcons[listing.category || "Other"]

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-accent/10 p-2 rounded-lg shrink-0">{icon}</div>
            <CardTitle className="text-lg line-clamp-2">{listing.itemName}</CardTitle>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {listing.lendingPrice} pts
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
          {onContact && (
            <Button variant="default" size="sm" className="w-full" onClick={() => onContact(listing)}>
              Contact Lender
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

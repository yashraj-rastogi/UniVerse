"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Calendar, User } from "lucide-react"
import { getUserBorrowedItems, Listing } from "@/lib/firebase/jugaadbank"
import { Badge } from "@/components/ui/badge"

export function BorrowedItems({ userId }: { userId: string }) {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      try {
        const borrowed = await getUserBorrowedItems(userId)
        setItems(borrowed)
      } catch (error) {
        console.error("Failed to load borrowed items", error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [userId])

  if (loading) {
    return (
      <Card className="h-full border-2 border-primary/10 shadow-lg mt-8">
        <CardHeader>
          <CardTitle>Borrowed Items</CardTitle>
          <CardDescription>Items you have currently borrowed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-2 border-primary/10 shadow-lg mt-8">
      <CardHeader>
        <CardTitle>Borrowed Items</CardTitle>
        <CardDescription>Items you have currently borrowed from Jugaad Bank</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No borrowed items found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold truncate">{item.itemName}</div>
                  <Badge variant="secondary">Borrowed</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-auto space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">Owner: {item.ownerEmail}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

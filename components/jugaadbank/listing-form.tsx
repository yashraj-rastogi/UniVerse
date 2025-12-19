"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createListing } from "@/lib/firebase/jugaadbank"
import { getUserProfile } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"

interface ListingFormProps {
  onListingCreated?: () => void
}

const CATEGORIES = [
  "Scientific Calculator",
  "Lab Coat",
  "Textbooks",
  "Lab Equipment",
  "Engineering Tools",
  "Sports Equipment",
  "Musical Instruments",
  "Other",
]

export function ListingForm({ onListingCreated }: ListingFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    lendingPrice: "",
    category: "Other",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const profile = await getUserProfile(user.uid)

      if (!profile) {
        throw new Error("User profile not found")
      }

      await createListing(
        formData.itemName,
        formData.description,
        Number(formData.lendingPrice),
        user.uid,
        profile.email,
        profile.rollNumber,
        formData.category,
      )

      toast({
        title: "Listing created successfully",
        description: "Your item is now available in JugaadBank",
      })

      // Reset form
      setFormData({
        itemName: "",
        description: "",
        lendingPrice: "",
        category: "Other",
      })

      if (onListingCreated) {
        onListingCreated()
      }
    } catch (error) {
      console.error("Error creating listing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Listing
        </CardTitle>
        <CardDescription>List an item to lend to fellow students and earn points</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              placeholder="e.g., TI-84 Scientific Calculator"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about condition, usage, availability..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lendingPrice">Lending Price (Points)</Label>
            <Input
              id="lendingPrice"
              type="number"
              min="0"
              placeholder="e.g., 50"
              value={formData.lendingPrice}
              onChange={(e) => setFormData({ ...formData, lendingPrice: e.target.value })}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Set your lending price in points (not cash)</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Listing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

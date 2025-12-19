"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createRequest } from "@/lib/firebase/jugaadbank"
import { getUserProfile } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Loader2 } from "lucide-react"

interface RequestFormProps {
  onRequestCreated?: () => void
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

export function RequestForm({ onRequestCreated }: RequestFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    offeringPrice: "",
    category: "Other",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a request",
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

      await createRequest(
        formData.itemName,
        formData.description,
        Number(formData.offeringPrice),
        user.uid,
        profile.email,
        profile.rollNumber,
        formData.category,
      )

      toast({
        title: "Request created successfully",
        description: "Your request is now visible to all students",
      })

      // Reset form
      setFormData({
        itemName: "",
        description: "",
        offeringPrice: "",
        category: "Other",
      })

      if (onRequestCreated) {
        onRequestCreated()
      }
    } catch (error) {
      console.error("Error creating request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create request",
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
          <Search className="h-5 w-5" />
          Post a Request
        </CardTitle>
        <CardDescription>Looking for an item? Let other students know what you need</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestItemName">Item Name</Label>
            <Input
              id="requestItemName"
              placeholder="e.g., Casio Scientific Calculator"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestCategory">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger id="requestCategory">
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
            <Label htmlFor="requestDescription">Description</Label>
            <Textarea
              id="requestDescription"
              placeholder="Describe what you're looking for, when you need it, etc..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offeringPrice">Offering Price (Points)</Label>
            <Input
              id="offeringPrice"
              type="number"
              min="0"
              placeholder="e.g., 30"
              value={formData.offeringPrice}
              onChange={(e) => setFormData({ ...formData, offeringPrice: e.target.value })}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">How many points are you willing to pay?</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Request...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Post Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

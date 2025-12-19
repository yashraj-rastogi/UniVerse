"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getAvailableListings, getActiveRequests, type Listing, type Request } from "@/lib/firebase/jugaadbank"
import { getUserProfile } from "@/lib/firebase/auth"
import { createOrGetChat } from "@/lib/firebase/chat"
import { ListingForm } from "@/components/jugaadbank/listing-form"
import { ListingCard } from "@/components/jugaadbank/listing-card"
import { RequestForm } from "@/components/jugaadbank/request-form"
import { RequestCard } from "@/components/jugaadbank/request-card"
import { ChatWindow } from "@/components/chat/chat-window"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Recycle, Loader2, ShoppingBag, MessageCircle } from "lucide-react"
import Link from "next/link"

import type { Chat } from "@/lib/firebase/chat"

export default function JugaadBankPage() {
  const { user, loading: authLoading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [userRollNumber, setUserRollNumber] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        if (profile) {
          setUserRollNumber(profile.rollNumber)
        }
      })
    }
  }, [user])

  const loadListings = async () => {
    setLoading(true)
    try {
      const availableListings = await getAvailableListings()
      setListings(availableListings)
    } catch (error) {
      console.error("Error loading listings:", error)
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const activeRequests = await getActiveRequests()
      setRequests(activeRequests)
    } catch (error) {
      console.error("Error loading requests:", error)
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadListings()
      loadRequests()
    }
  }, [user])

  const handleListingCreated = () => {
    loadListings()
  }

  const handleRequestCreated = () => {
    loadRequests()
  }

  const handleContactLender = async (listing: Listing) => {
    if (!user || !userRollNumber) return

    try {
      const chatId = await createOrGetChat(
        user.uid,
        user.email || "",
        userRollNumber,
        listing.ownerUid,
        listing.ownerEmail,
        listing.ownerRollNumber,
        listing.id!,
        listing.itemName,
        "listing",
      )

      // Get the chat object to open chat window
      const { getChat } = await import("@/lib/firebase/chat")
      const chat = await getChat(chatId)
      if (chat) {
        setActiveChat(chat)
      }

      toast({
        title: "Chat opened",
        description: `Start chatting about "${listing.itemName}"`,
      })
    } catch (error) {
      console.error("Error opening chat:", error)
      toast({
        title: "Error",
        description: "Failed to open chat",
        variant: "destructive",
      })
    }
  }

  const handleContactRequester = async (request: Request) => {
    if (!user || !userRollNumber) return

    try {
      const chatId = await createOrGetChat(
        user.uid,
        user.email || "",
        userRollNumber,
        request.requesterUid,
        request.requesterEmail,
        request.requesterRollNumber,
        request.id!,
        request.itemName,
        "request",
      )

      // Get the chat object to open chat window
      const { getChat } = await import("@/lib/firebase/chat")
      const chat = await getChat(chatId)
      if (chat) {
        setActiveChat(chat)
      }

      toast({
        title: "Chat opened",
        description: `Start chatting about "${request.itemName}"`,
      })
    } catch (error) {
      console.error("Error opening chat:", error)
      toast({
        title: "Error",
        description: "Failed to open chat",
        variant: "destructive",
      })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading JugaadBank...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="w-full px-4 py-6 md:px-8 border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-accent p-2 rounded-lg">
                <Recycle className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">JugaadBank</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Peer-to-Peer Marketplace</p>
              </div>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/chats">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">My Chats</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            <Tabs defaultValue="browse" className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="browse">Browse Items</TabsTrigger>
                <TabsTrigger value="list">List an Item</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Available Items</h2>
                  <p className="text-muted-foreground">
                    Borrow high-waste items from fellow students. Save money, reduce waste.
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                      <Recycle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No items available yet</h3>
                      <p className="text-muted-foreground">Be the first to list an item in JugaadBank!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} onContact={handleContactLender} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">List Your Item</h2>
                  <p className="text-muted-foreground">
                    Lend your unused items to fellow students and earn points. Help reduce waste on campus.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <ListingForm onListingCreated={handleListingCreated} />
                </div>

                <div className="max-w-2xl mx-auto bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold">Common High-Waste Items to List:</h3>
                  <ul className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Scientific Calculators
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Lab Coats & Safety Gear
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Textbooks & Study Guides
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Lab Equipment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Engineering Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Sports Equipment
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Tabs defaultValue="view" className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="view">View Requests</TabsTrigger>
                <TabsTrigger value="post">Post Request</TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Student Requests</h2>
                  <p className="text-muted-foreground">
                    See what items students are looking for. Help your peers and earn points.
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No requests yet</h3>
                      <p className="text-muted-foreground">Be the first to post what you're looking for!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {requests.map((request) => (
                      <RequestCard key={request.id} request={request} onContact={handleContactRequester} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="post" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Post a Request</h2>
                  <p className="text-muted-foreground">
                    Looking for something specific? Let other students know what you need.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <RequestForm onRequestCreated={handleRequestCreated} />
                </div>

                <div className="max-w-2xl mx-auto bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold">Tips for Posting Requests:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                      <span>Be specific about what you need and when you need it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                      <span>Mention the condition you're looking for</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                      <span>Offer a fair price in points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                      <span>Include your urgency level in the description</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      {activeChat && <ChatWindow chat={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  )
}

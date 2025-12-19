"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserChats, type SecureChat } from "@/lib/firebase/thirdspace"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquareLock, Loader2 } from "lucide-react"

export default function InboxPage() {
  const { user, loading: authLoading } = useAuth()
  const [chats, setChats] = useState<SecureChat[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadChats = async () => {
      if (!user) return
      try {
        const fetchedChats = await getUserChats(user.uid)
        setChats(fetchedChats)
      } catch (error) {
        console.error("Error loading chats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadChats()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/thirdspace")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquareLock className="h-6 w-6" />
            Secure Inbox
          </h1>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No secure chats yet.</p>
            <p className="text-sm mt-2">Start a discussion from the feed!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => {
              const isOP = user?.uid === chat.participants[0]
              return (
                <Card 
                  key={chat.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/thirdspace/chat/${chat.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex justify-between items-center">
                      <span>{isOP ? "Discussion with Peer" : "Discussion with OP"}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {chat.lastMessageTimestamp?.toDate 
                          ? chat.lastMessageTimestamp.toDate().toLocaleDateString() 
                          : "New"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                    <div className="mt-2 text-xs bg-muted p-1.5 rounded text-muted-foreground line-clamp-1">
                      Re: "{chat.postContent}"
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

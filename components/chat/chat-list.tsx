"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { subscribeToUserChats, type Chat } from "@/lib/firebase/chat"
import { ChatWindow } from "./chat-window"

export function ChatList() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats)
    })

    return () => unsubscribe()
  }, [user])

  if (!user) return null

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Conversations</h2>
        {chats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start chatting by contacting lenders or requesters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => {
              const otherParticipantId = chat.participants.find((id) => id !== user.uid)
              const otherParticipant = otherParticipantId ? chat.participantDetails[otherParticipantId] : null

              return (
                <Card
                  key={chat.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedChat(chat)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{chat.itemName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Roll #{otherParticipant?.rollNumber}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">{otherParticipant?.email}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{chat.itemType === "listing" ? "Rental" : "Request"}</Badge>
                    </div>
                  </CardHeader>
                  {chat.lastMessage && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{chat.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(chat.lastMessageAt).toLocaleString()}
                      </p>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {selectedChat && <ChatWindow chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getSecureChat, sendMessage, subscribeToMessages, type SecureChat, type SecureMessage } from "@/lib/firebase/thirdspace"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Lock } from "lucide-react"

interface SecureChatWindowProps {
  chatId: string
}

export function SecureChatWindow({ chatId }: SecureChatWindowProps) {
  const { user } = useAuth()
  const [chat, setChat] = useState<SecureChat | null>(null)
  const [messages, setMessages] = useState<SecureMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const loadChat = async () => {
      if (!user) return
      const chatData = await getSecureChat(chatId)
      if (!chatData) {
        router.push("/thirdspace")
        return
      }
      // Verify participation
      if (!chatData.participants.includes(user.uid)) {
        router.push("/thirdspace")
        return
      }
      setChat(chatData)
      setLoading(false)
    }
    loadChat()
  }, [chatId, user, router])

  useEffect(() => {
    if (!chat) return
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs)
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    })
    return () => unsubscribe()
  }, [chatId, chat])

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return
    await sendMessage(chatId, user.uid, newMessage)
    setNewMessage("")
  }

  if (loading || !chat || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Lock className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">Establishing secure connection...</p>
        </div>
      </div>
    )
  }

  const isOP = user.uid === chat.participants[0] // Assuming index 0 is OP based on createSecureChat

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-card shadow-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Secure Channel
          </h2>
          <p className="text-xs text-muted-foreground">
            Encrypted • Anonymous • {isOP ? "You are OP" : "You are Peer"}
          </p>
        </div>
      </div>

      {/* Context Snippet */}
      <div className="bg-muted/30 p-3 border-b text-sm italic text-muted-foreground px-6">
        " {chat.postContent.length > 100 ? chat.postContent.substring(0, 100) + "..." : chat.postContent} "
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto pb-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid
            const isMsgOP = msg.senderId === chat.participants[0]
            
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {isMsgOP ? "OP" : "Peer"} • {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just now"}
                </span>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            placeholder="Type a secure message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

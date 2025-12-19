"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Send, MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { sendMessage, subscribeToMessages, type Message, type Chat } from "@/lib/firebase/chat"
import { getUserProfile } from "@/lib/firebase/auth"

interface ChatWindowProps {
  chat: Chat
  onClose: () => void
}

export function ChatWindow({ chat, onClose }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [userRollNumber, setUserRollNumber] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get other participant
  const otherParticipantId = chat.participants.find((id) => id !== user?.uid)
  const otherParticipant = otherParticipantId ? chat.participantDetails[otherParticipantId] : null

  useEffect(() => {
    if (!user) return

    // Get current user's roll number
    getUserProfile(user.uid).then((profile) => {
      if (profile) {
        setUserRollNumber(profile.rollNumber)
      }
    })

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(chat.id, (msgs) => {
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [chat.id, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !userRollNumber) return

    setLoading(true)
    try {
      await sendMessage(chat.id, user.uid, user.email || "", userRollNumber, newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-md h-[600px] shadow-2xl z-50 flex flex-col md:max-w-lg">
      <CardHeader className="border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{chat.itemName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {otherParticipant?.rollNumber}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">{otherParticipant?.email}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation about {chat.itemName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  message.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm break-words">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="border-t p-3 shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder={`Message about ${chat.itemName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !newMessage.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

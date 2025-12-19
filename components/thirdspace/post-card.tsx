import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MessageSquareLock } from "lucide-react"
import type { Post } from "@/lib/firebase/thirdspace"
import { createSecureChat } from "@/lib/firebase/thirdspace"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PostCardProps {
  post: Post
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter()
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  // Generate a consistent color based on the alias for the avatar background
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", 
      "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500", 
      "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", 
      "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", 
      "bg-rose-500"
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const handleDiscuss = async () => {
    if (!currentUserId || isCreatingChat) return
    
    // Don't allow chatting with yourself
    if (post.userId === currentUserId) return

    setIsCreatingChat(true)
    try {
      const chatId = await createSecureChat(post.id!, post.content, post.userId, currentUserId)
      router.push(`/thirdspace/chat/${chatId}`)
    } catch (error) {
      console.error("Failed to start chat", error)
      setIsCreatingChat(false)
    }
  }

  const avatarColor = getAvatarColor(post.alias)
  const initials = post.alias.split(" ").map(n => n[0]).join("")

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarFallback className={`${avatarColor} text-white font-bold`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{post.alias}</span>
          <span className="text-xs text-muted-foreground">
            {post.createdAt instanceof Date ? post.createdAt.toLocaleDateString() : "Just now"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        
        <div className="flex items-center gap-4 pt-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 px-2">
            <Heart className="h-4 w-4 mr-1.5" />
            <span className="text-xs">{post.likes}</span>
          </Button>
          
          {post.userId !== currentUserId && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary px-2"
              onClick={handleDiscuss}
              disabled={isCreatingChat}
            >
              <MessageSquareLock className="h-4 w-4 mr-1.5" />
              <span className="text-xs">{isCreatingChat ? "Opening..." : "Discuss Privately"}</span>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2 ml-auto">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

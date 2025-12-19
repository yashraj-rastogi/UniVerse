"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createPost } from "@/lib/firebase/thirdspace"
import { checkContentSafety } from "@/app/actions/safety"
import { Loader2, PenLine } from "lucide-react"

interface CreatePostModalProps {
  userId: string
  onPostCreated: () => void
}

export function CreatePostModal({ userId, onPostCreated }: CreatePostModalProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "checking" | "posting">("idle")
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!content.trim()) return

    setLoading(true)
    setStatus("checking")
    
    try {
      // 1. Check safety
      const safetyResult = await checkContentSafety(content)
      
      if (!safetyResult.isSafe) {
        toast({
          title: "Content Warning",
          description: safetyResult.error || "This post was flagged as unsafe (bullying/harassment). Please revise.",
          variant: "destructive",
        })
        setLoading(false)
        setStatus("idle")
        return
      }

      setStatus("posting")
      // 2. Create post if safe
      await createPost(content, userId)
      toast({
        title: "Post Created",
        description: "Your voice has been heard.",
      })
      setContent("")
      setOpen(false)
      onPostCreated()
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setStatus("idle")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        >
          <PenLine className="h-6 w-6" />
          <span className="sr-only">Speak Your Mind</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Speak Your Mind</DialogTitle>
          <DialogDescription>
            Share your thoughts anonymously. Your identity will be masked as a random alias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[150px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {status === "checking" ? "Checking Safety..." : "Posting..."}
              </>
            ) : (
              "Post Anonymously"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getPosts, type Post } from "@/lib/firebase/thirdspace"
import { PostCard } from "@/components/thirdspace/post-card"
import { CreatePostModal } from "@/components/thirdspace/create-post-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Ghost, Loader2, MessageSquareLock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ThirdSpacePage() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error loading posts:", error)
      toast({
        title: "Error",
        description: "Failed to load the feed.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadPosts()
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Ghost className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">ThirdSpace</h1>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" asChild>
            <Link href="/thirdspace/inbox">
              <MessageSquareLock className="h-5 w-5" />
              <span className="sr-only">Inbox</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2 text-center py-4">
          <h2 className="text-2xl font-bold tracking-tight">The Anonymous Feed</h2>
          <p className="text-muted-foreground">
            A safe space for students to share thoughts, confessions, and ideas without judgment.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <Ghost className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">It's quiet here...</h3>
              <p className="text-muted-foreground">Be the first to speak your mind.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.uid || ""} />
            ))}
          </div>
        )}
      </main>

      <CreatePostModal userId={user.uid} onPostCreated={loadPosts} />
    </div>
  )
}

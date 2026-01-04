"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Wallet, Ghost, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useEffect, useState } from "react"
import { getUserProfile, type UserProfile } from "@/lib/firebase/auth"

const navItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "JugaadBank",
    href: "/jugaadbank",
    icon: Wallet,
  },
  {
    name: "ThirdSpace",
    href: "/thirdspace",
    icon: Ghost,
    isSpecial: true,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid)
          setProfile(userProfile)
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }
    loadProfile()
  }, [user])

  // Don't show bottom nav in ThirdSpace (it has its own navigation style)
  const isThirdSpace = pathname?.startsWith("/thirdspace")
  
  if (isThirdSpace) return null

  const filteredNavItems = profile?.role === "teacher" 
    ? navItems.filter(item => item.name === "Home" || item.name === "Profile")
    : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t safe-area-pb">
      <div className="max-w-lg mx-auto px-2">
        <ul className="flex items-center justify-around py-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname?.startsWith(item.href.split("#")[0]))
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                    item.isSpecial && !isActive && "text-purple-500 hover:text-purple-600"
                  )}
                >
                  <div
                    className={cn(
                      "relative p-2 rounded-xl transition-all duration-300",
                      isActive && "bg-primary/10 scale-110",
                      item.isSpecial && isActive && "bg-purple-500/10",
                      item.isSpecial && !isActive && "hover:bg-purple-500/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        isActive && "scale-110",
                        item.isSpecial && "text-purple-500"
                      )}
                    />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium mt-1 transition-all duration-300",
                      isActive && "font-semibold",
                      item.isSpecial && "text-purple-500"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

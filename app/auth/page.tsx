"use client"

import { useState } from "react"
import { RegisterForm } from "@/components/auth/register-form"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { Shield, Users, BookOpen } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-6 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-lg">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="text-2xl font-bold">UniVerse</span>
        </div>
        <ModeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Information */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
                Your Exclusive Student Community
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
                Connect, collaborate, and grow with verified students from universities across the nation.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Verified Students Only</h3>
                  <p className="text-sm text-muted-foreground">
                    Strictly .edu emails - ensuring authentic student interactions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Accountable Community</h3>
                  <p className="text-sm text-muted-foreground">Roll numbers linked to maintain a safe environment</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Student Lifestyle</h3>
                  <p className="text-sm text-muted-foreground">Earn perks, borrow items, and share anonymously</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto space-y-4">
            {/* Toggle Buttons */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={mode === "register" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setMode("register")}
              >
                Register
              </Button>
              <Button
                variant={mode === "login" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setMode("login")}
              >
                Login
              </Button>
            </div>

            {/* Form */}
            {mode === "register" ? <RegisterForm /> : <LoginForm />}

            {/* Footer Note */}
            <p className="text-xs text-center text-muted-foreground px-4">
              By continuing, you agree to maintain respectful and authentic interactions within the student community.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-6 text-center text-sm text-muted-foreground">
        <p>UniVerse &copy; 2025 - Connecting Students Nationwide</p>
      </footer>
    </div>
  )
}

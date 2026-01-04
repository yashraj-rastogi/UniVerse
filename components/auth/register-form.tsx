"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp, validateStudentEmail } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User, GraduationCap } from "lucide-react"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Real-time validation
    if (value && !validateStudentEmail(value)) {
      setEmailError("Please use your .edu email address")
    } else {
      setEmailError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate email domain
      if (!validateStudentEmail(email)) {
        throw new Error("Only .edu email addresses are allowed. Please use your college email.")
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      // Sign up user, role
      await signUp(email, password, rollNumber, role)

      toast({
        title: "Registration successful!",
        description: "Welcome to UniVerse. Your account has been created.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-accent/10 p-3 rounded-full">
            <GraduationCap className="h-8 w-8 text-accent" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-balance">Join UniVerse</CardTitle>
        <CardDescription className="text-center text-balance">
          Exclusively for verified students. Use your .edu email to register.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Student Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="yourname@university.edu"
                value={email}
                onChange={handleEmailChange}
                required
                className="pl-10"
                disabled={loading}
              />
            </div>
            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            <p className="text-xs text-muted-foreground">Must be a valid .edu email address</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a</Label>
            <Select value={role} onValueChange={(value: "student" | "teacher") => setRole(value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollNumber">{role === "teacher" ? "Employee ID" : "Roll Number"}</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="rollNumber"
                type="text"
                placeholder={role === "teacher" ? "e.g., EMP2024001" : "e.g., CS2024001"}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                className="pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">For accountability and verification</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !!emailError}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

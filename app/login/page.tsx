"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain } from "lucide-react"

// Dummy users with roles
const USERS = [
  { email: "doctor@example.com", password: "doctor123", role: "doctor" },
  { email: "radiologist@example.com", password: "radio123", role: "radiologist" },
  { email: "dataentry@example.com", password: "data123", role: "data-entry" },
  { email: "analyst@example.com", password: "analyst123", role: "analyst" },
  { email: "admin@example.com", password: "admin123", role: "admin" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const user = USERS.find((u) => u.email === email && u.password === password)

    if (user) {
      // Store user role in sessionStorage
      sessionStorage.setItem("userRole", user.role)
      sessionStorage.setItem("userEmail", user.email)

      // Redirect to role-specific dashboard
      router.push(`/dashboard/${user.role}`)
    } else {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-md px-4 pt-32 pb-20">
        <div className="text-center mb-8">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Secure Login</h1>
          <p className="text-muted-foreground">Access your role-based dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Demo Accounts:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">doctor@example.com / doctor123</code>
                </div>
                <div className="flex justify-between">
                  <span>Radiologist:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">radiologist@example.com / radio123</code>
                </div>
                <div className="flex justify-between">
                  <span>Data Entry:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">dataentry@example.com / data123</code>
                </div>
                <div className="flex justify-between">
                  <span>Analyst:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">analyst@example.com / analyst123</code>
                </div>
                <div className="flex justify-between">
                  <span>Admin:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">admin@example.com / admin123</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

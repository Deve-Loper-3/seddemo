"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Brain, Database, LogIn, ScanLine, Shield, Stethoscope, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStore } from "@/lib/store"
import { DEMO_ACCOUNTS } from "@/lib/seed"
import { ROLE_LABELS, type Role } from "@/lib/types"

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  doctor: Stethoscope,
  radiologist: ScanLine,
  "data-entry": Database,
  analyst: TrendingUp,
  admin: Shield,
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { login, user, ready } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (ready && user) router.replace(`/dashboard/${user.role}`)
  }, [ready, user, router])

  const doLogin = (em: string, pw: string) => {
    setError("")
    const res = login(em, pw)
    if (!res.ok) {
      setError(res.error)
      return
    }
    toast.success(`Welcome, ${res.user.name}`)
    const next = params.get("next")
    router.push(next && next.startsWith(`/dashboard/${res.user.role}`) ? next : `/dashboard/${res.user.role}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doLogin(email, password)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 pt-28 pb-20">
      <div className="text-center mb-8">
        <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Secure Login</h1>
        <p className="text-muted-foreground">Access your role-based research dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your study credentials</CardDescription>
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
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full" disabled={!ready}>
                <LogIn className="h-4 w-4 mr-2" /> Sign in
              </Button>
              <p className="text-xs text-muted-foreground">
                Accounts created by an administrator in <em>User Management</em> can sign in here too.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo accounts</CardTitle>
            <CardDescription>One click to sign in as each study role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_ACCOUNTS.map((a) => {
              const Icon = ROLE_ICONS[a.role]
              return (
                <button
                  key={a.email}
                  type="button"
                  disabled={!ready}
                  onClick={() => {
                    setEmail(a.email)
                    setPassword(a.password)
                    doLogin(a.email, a.password)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{ROLE_LABELS[a.role]}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.email} / {a.password}
                    </div>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

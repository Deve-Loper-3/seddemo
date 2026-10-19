"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function toTitleCase(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

export default function RoleFeaturePage() {
  const params = useParams()
  const router = useRouter()
  const role = (params.role as string) || ""
  const feature = (params.feature as string) || ""
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    const storedEmail = sessionStorage.getItem("userEmail")
    if (!storedRole || storedRole !== role) {
      router.push("/login")
    } else {
      setUserEmail(storedEmail || "")
    }
  }, [role, router])

  const featureTitle = useMemo(() => toTitleCase(feature), [feature])
  const roleTitle = useMemo(() => toTitleCase(role), [role])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{featureTitle}</h1>
            <p className="text-muted-foreground">
              {roleTitle} feature page • Logged in as: {userEmail || "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/${role}`}>Back to {roleTitle} Dashboard</Link>
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{featureTitle}</CardTitle>
            <CardDescription>
              Starter page for {roleTitle} → {featureTitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is a scaffolded page. Add your feature-specific UI, forms, tables, or workflows here.
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Define data fetching and actions as needed.</li>
              <li>Follow existing patterns for components and styling.</li>
              <li>Use SWR for client data sync if necessary.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

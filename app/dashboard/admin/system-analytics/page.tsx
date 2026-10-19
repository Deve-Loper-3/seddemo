"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, BarChart3, Users, Database, Activity } from "lucide-react"

const USAGE_STATS = [
  { day: "Mon", logins: 18, uploads: 42, analyses: 67 },
  { day: "Tue", logins: 21, uploads: 38, analyses: 71 },
  { day: "Wed", logins: 19, uploads: 51, analyses: 84 },
  { day: "Thu", logins: 22, uploads: 45, analyses: 78 },
  { day: "Fri", logins: 20, uploads: 47, analyses: 82 },
  { day: "Sat", logins: 12, uploads: 28, analyses: 43 },
  { day: "Sun", logins: 9, uploads: 22, analyses: 35 },
]

const SYSTEM_HEALTH = [
  { metric: "Database Performance", value: 98, status: "excellent" },
  { metric: "API Response Time", value: 95, status: "excellent" },
  { metric: "Storage Usage", value: 67, status: "good" },
  { metric: "AI Model Uptime", value: 99.8, status: "excellent" },
]

export default function SystemAnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "admin") {
      router.push("/login")
    }
  }, [router])

  const totalLogins = USAGE_STATS.reduce((acc, d) => acc + d.logins, 0)
  const totalUploads = USAGE_STATS.reduce((acc, d) => acc + d.uploads, 0)
  const totalAnalyses = USAGE_STATS.reduce((acc, d) => acc + d.analyses, 0)
  const maxValue = Math.max(...USAGE_STATS.map((d) => Math.max(d.logins, d.uploads, d.analyses)))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">System Analytics</h1>
        </div>
        <p className="text-muted-foreground mb-8">Monitor overall system usage</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalLogins}</div>
                  <div className="text-sm text-muted-foreground">Total Logins</div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalUploads}</div>
                  <div className="text-sm text-muted-foreground">Scans Uploaded</div>
                </div>
                <Database className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalAnalyses}</div>
                  <div className="text-sm text-muted-foreground">AI Analyses</div>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">99.8%</div>
                  <div className="text-sm text-muted-foreground">System Uptime</div>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>System usage metrics for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {USAGE_STATS.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="font-medium text-sm">{day.day}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-xs text-muted-foreground">Logins</div>
                      <div className="flex-1 h-6 bg-primary/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 flex items-center justify-end pr-2 text-xs font-medium text-white"
                          style={{ width: `${(day.logins / maxValue) * 100}%` }}
                        >
                          {day.logins}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-xs text-muted-foreground">Uploads</div>
                      <div className="flex-1 h-6 bg-primary/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 flex items-center justify-end pr-2 text-xs font-medium text-white"
                          style={{ width: `${(day.uploads / maxValue) * 100}%` }}
                        >
                          {day.uploads}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-xs text-muted-foreground">Analyses</div>
                      <div className="flex-1 h-6 bg-primary/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary flex items-center justify-end pr-2 text-xs font-medium text-white"
                          style={{ width: `${(day.analyses / maxValue) * 100}%` }}
                        >
                          {day.analyses}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SYSTEM_HEALTH.map((item) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.metric}</span>
                    <span className="text-muted-foreground">
                      {item.value}%{" "}
                      <span
                        className={`ml-2 ${
                          item.status === "excellent"
                            ? "text-green-600"
                            : item.status === "good"
                              ? "text-blue-600"
                              : "text-orange-600"
                        }`}
                      >
                        ({item.status})
                      </span>
                    </span>
                  </div>
                  <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        item.status === "excellent"
                          ? "bg-green-500"
                          : item.status === "good"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

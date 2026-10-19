"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Shield, Lock, Key, AlertTriangle } from "lucide-react"

const ROLE_PERMISSIONS = [
  {
    role: "Doctor",
    permissions: ["View patient cases", "Review AI diagnoses", "Access patient records", "View treatment outcomes"],
    users: 8,
  },
  {
    role: "Radiologist",
    permissions: ["Analyze MRI scans", "Validate AI predictions", "View accuracy metrics", "Collaborate on cases"],
    users: 5,
  },
  {
    role: "Data Entry",
    permissions: ["Input patient data", "Upload MRI scans", "Manage database records", "View entry statistics"],
    users: 6,
  },
  {
    role: "Analyst",
    permissions: ["Perform statistical analysis", "Evaluate AI performance", "Generate reports", "Analyze trends"],
    users: 3,
  },
  {
    role: "Admin",
    permissions: ["Manage users", "Configure system settings", "Control security", "View all analytics"],
    users: 1,
  },
]

const SECURITY_LOGS = [
  {
    id: "LOG-2024-089",
    event: "Failed login attempt",
    user: "unknown@external.com",
    timestamp: "2024-01-15 14:23",
    severity: "medium",
  },
  {
    id: "LOG-2024-088",
    event: "Password changed",
    user: "sarah.chen@hospital.org",
    timestamp: "2024-01-15 10:15",
    severity: "low",
  },
  {
    id: "LOG-2024-087",
    event: "New user created",
    user: "admin@system.org",
    timestamp: "2024-01-14 16:30",
    severity: "low",
  },
  {
    id: "LOG-2024-086",
    event: "Multiple failed login attempts",
    user: "test@test.com",
    timestamp: "2024-01-14 09:45",
    severity: "high",
  },
]

export default function SecurityAccessPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "admin") {
      router.push("/login")
    }
  }, [router])

  const totalUsers = ROLE_PERMISSIONS.reduce((acc, r) => acc + r.users, 0)
  const highSeverityLogs = SECURITY_LOGS.filter((l) => l.severity === "high").length

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
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Security & Access</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manage permissions and security</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <Key className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{ROLE_PERMISSIONS.length}</div>
                  <div className="text-sm text-muted-foreground">User Roles</div>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{highSeverityLogs}</div>
                  <div className="text-sm text-muted-foreground">Security Alerts</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Permissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Access control by user role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROLE_PERMISSIONS.map((role) => (
                <div key={role.role} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-lg">{role.role}</div>
                      <Badge variant="outline">{role.users} users</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>System security and access logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SECURITY_LOGS.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium">{log.event}</div>
                      <Badge
                        variant={
                          log.severity === "high" ? "destructive" : log.severity === "medium" ? "secondary" : "outline"
                        }
                      >
                        {log.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.user} • {log.timestamp}
                    </div>
                  </div>
                  {log.severity === "high" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

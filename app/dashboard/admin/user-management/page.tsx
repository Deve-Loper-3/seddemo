"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Users, Plus, Edit, Trash2, Shield } from "lucide-react"

const USERS = [
  {
    id: "USR-001",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@hospital.org",
    role: "doctor",
    institution: "City General Hospital",
    status: "active",
    lastLogin: "2024-01-15 14:23",
  },
  {
    id: "USR-002",
    name: "Dr. Michael Torres",
    email: "m.torres@medcenter.org",
    role: "radiologist",
    institution: "Medical Center",
    status: "active",
    lastLogin: "2024-01-15 13:45",
  },
  {
    id: "USR-003",
    name: "Emily Rodriguez",
    email: "e.rodriguez@hospital.org",
    role: "data-entry",
    institution: "City General Hospital",
    status: "active",
    lastLogin: "2024-01-15 12:30",
  },
  {
    id: "USR-004",
    name: "Dr. James Wilson",
    email: "j.wilson@research.org",
    role: "analyst",
    institution: "Research Institute",
    status: "active",
    lastLogin: "2024-01-14 16:12",
  },
  {
    id: "USR-005",
    name: "Dr. Lisa Anderson",
    email: "l.anderson@hospital.org",
    role: "doctor",
    institution: "City General Hospital",
    status: "inactive",
    lastLogin: "2023-12-20 10:15",
  },
]

export default function UserManagementPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "admin") {
      router.push("/login")
    }
  }, [router])

  const activeUsers = USERS.filter((u) => u.status === "active").length
  const inactiveUsers = USERS.filter((u) => u.status === "inactive").length

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

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">User Management</h1>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">Add, edit, and manage user accounts</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{USERS.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{inactiveUsers}</div>
              <div className="text-sm text-muted-foreground">Inactive Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage system user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {USERS.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-semibold">{user.name}</div>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {user.institution}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Last login: {user.lastLogin}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Permissions
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

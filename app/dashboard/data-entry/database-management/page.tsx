"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Database, Edit, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const RECENT_RECORDS = [
  {
    id: "PT-8827",
    name: "John Anderson",
    age: 68,
    gender: "Male",
    admissionDate: "2024-01-15",
    status: "complete",
    lastModified: "2024-01-15 14:23",
  },
  {
    id: "PT-8826",
    name: "Maria Garcia",
    age: 72,
    gender: "Female",
    admissionDate: "2024-01-15",
    status: "incomplete",
    lastModified: "2024-01-15 13:45",
  },
  {
    id: "PT-8825",
    name: "Robert Chen",
    age: 55,
    gender: "Male",
    admissionDate: "2024-01-14",
    status: "complete",
    lastModified: "2024-01-14 16:12",
  },
  {
    id: "PT-8824",
    name: "Sarah Williams",
    age: 61,
    gender: "Female",
    admissionDate: "2024-01-14",
    status: "complete",
    lastModified: "2024-01-14 15:30",
  },
  {
    id: "PT-8823",
    name: "David Thompson",
    age: 70,
    gender: "Male",
    admissionDate: "2024-01-13",
    status: "complete",
    lastModified: "2024-01-13 11:20",
  },
]

export default function DatabaseManagementPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "data-entry") {
      router.push("/login")
    }
  }, [router])

  const completeRecords = RECENT_RECORDS.filter((r) => r.status === "complete").length
  const incompleteRecords = RECENT_RECORDS.filter((r) => r.status === "incomplete").length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/data-entry">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Database Management</h1>
        </div>
        <p className="text-muted-foreground mb-8">Organize and update records</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{completeRecords}</div>
              <div className="text-sm text-muted-foreground">Complete Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{incompleteRecords}</div>
              <div className="text-sm text-muted-foreground">Incomplete Records</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by Patient ID, name, or date..." className="pl-10" />
              </div>
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>Recently modified patient records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_RECORDS.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-semibold">{record.id}</div>
                      <Badge variant={record.status === "complete" ? "default" : "secondary"}>
                        {record.status === "complete" ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.name} • {record.age}y {record.gender} • Admitted: {record.admissionDate}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Last modified: {record.lastModified}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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

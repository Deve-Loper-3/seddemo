"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, AlertCircle, CheckCircle } from "lucide-react"

const PATIENT_CASES = [
  {
    id: "PC-2024-001",
    patientName: "John Anderson",
    age: 67,
    admissionDate: "2024-01-15",
    status: "Active",
    strokeType: "Ischemic - Large Vessel",
    severity: "Moderate",
    lastUpdate: "2 hours ago",
  },
  {
    id: "PC-2024-002",
    patientName: "Maria Garcia",
    age: 54,
    admissionDate: "2024-01-14",
    status: "Under Review",
    strokeType: "Ischemic - Small Vessel",
    severity: "Mild",
    lastUpdate: "5 hours ago",
  },
  {
    id: "PC-2024-003",
    patientName: "Robert Chen",
    age: 72,
    admissionDate: "2024-01-13",
    status: "Completed",
    strokeType: "Ischemic - Cardioembolic",
    severity: "Severe",
    lastUpdate: "1 day ago",
  },
  {
    id: "PC-2024-004",
    patientName: "Sarah Williams",
    age: 61,
    admissionDate: "2024-01-12",
    status: "Active",
    strokeType: "Ischemic - Lacunar",
    severity: "Mild",
    lastUpdate: "3 hours ago",
  },
  {
    id: "PC-2024-005",
    patientName: "David Thompson",
    age: 58,
    admissionDate: "2024-01-11",
    status: "Under Review",
    strokeType: "Ischemic - Large Vessel",
    severity: "Moderate",
    lastUpdate: "6 hours ago",
  },
]

export default function PatientCasesPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    const storedEmail = sessionStorage.getItem("userEmail")
    if (!storedRole || storedRole !== "doctor") {
      router.push("/login")
    } else {
      setUserEmail(storedEmail || "")
    }
  }, [router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <AlertCircle className="h-4 w-4" />
      case "Under Review":
        return <Clock className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Under Review":
        return "secondary"
      case "Completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "text-red-600"
      case "Moderate":
        return "text-orange-600"
      case "Mild":
        return "text-yellow-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Patient Cases</h1>
            <p className="text-muted-foreground">View and manage patient stroke cases • Logged in as: {userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/doctor">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Total Active Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-muted-foreground">Completed Today</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {PATIENT_CASES.map((patientCase) => (
            <Card key={patientCase.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{patientCase.patientName}</CardTitle>
                      <Badge variant={getStatusVariant(patientCase.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(patientCase.status)}
                          {patientCase.status}
                        </span>
                      </Badge>
                    </div>
                    <CardDescription>Case ID: {patientCase.id}</CardDescription>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Age</div>
                    <div className="font-medium">{patientCase.age} years</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Admission Date</div>
                    <div className="font-medium">{patientCase.admissionDate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Stroke Type</div>
                    <div className="font-medium">{patientCase.strokeType}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Severity</div>
                    <div className={`font-medium ${getSeverityColor(patientCase.severity)}`}>
                      {patientCase.severity}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Last updated: {patientCase.lastUpdate}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

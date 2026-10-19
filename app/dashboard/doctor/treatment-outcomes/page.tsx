"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"

const TREATMENT_OUTCOMES = [
  {
    id: "TO-2024-001",
    patientName: "John Anderson",
    patientId: "PC-2024-001",
    treatmentType: "Thrombolysis (tPA)",
    startDate: "2024-01-15",
    duration: "3 days",
    nihssAdmission: 12,
    nihssCurrent: 6,
    improvement: "50%",
    status: "Improving",
    complications: "None",
    nextReview: "2024-01-18",
  },
  {
    id: "TO-2024-002",
    patientName: "Maria Garcia",
    patientId: "PC-2024-002",
    treatmentType: "Antiplatelet Therapy",
    startDate: "2024-01-14",
    duration: "4 days",
    nihssAdmission: 4,
    nihssCurrent: 2,
    improvement: "50%",
    status: "Improving",
    complications: "None",
    nextReview: "2024-01-17",
  },
  {
    id: "TO-2024-003",
    patientName: "Robert Chen",
    patientId: "PC-2024-003",
    treatmentType: "Mechanical Thrombectomy",
    startDate: "2024-01-13",
    duration: "5 days",
    nihssAdmission: 18,
    nihssCurrent: 16,
    improvement: "11%",
    status: "Stable",
    complications: "Minor bleeding",
    nextReview: "2024-01-16",
  },
  {
    id: "TO-2024-004",
    patientName: "Sarah Williams",
    patientId: "PC-2024-004",
    treatmentType: "Anticoagulation",
    startDate: "2024-01-12",
    duration: "6 days",
    nihssAdmission: 5,
    nihssCurrent: 1,
    improvement: "80%",
    status: "Excellent Recovery",
    complications: "None",
    nextReview: "2024-01-15",
  },
]

export default function TreatmentOutcomesPage() {
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
    if (status.includes("Improving") || status.includes("Excellent")) {
      return <TrendingUp className="h-4 w-4" />
    }
    if (status === "Stable") {
      return <Minus className="h-4 w-4" />
    }
    return <TrendingDown className="h-4 w-4" />
  }

  const getStatusVariant = (status: string) => {
    if (status.includes("Excellent")) return "default"
    if (status.includes("Improving")) return "secondary"
    return "outline"
  }

  const getImprovementColor = (improvement: string) => {
    const value = Number.parseInt(improvement)
    if (value >= 50) return "text-green-600"
    if (value >= 25) return "text-blue-600"
    if (value >= 10) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Treatment Outcomes</h1>
            <p className="text-muted-foreground">Track patient recovery and outcomes • Logged in as: {userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/doctor">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-muted-foreground">Active Treatments</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-muted-foreground">Improving</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">1</div>
                  <div className="text-sm text-muted-foreground">Stable</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">47.8%</div>
              <div className="text-sm text-muted-foreground">Avg Improvement</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {TREATMENT_OUTCOMES.map((outcome) => (
            <Card key={outcome.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{outcome.patientName}</CardTitle>
                      <Badge variant={getStatusVariant(outcome.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(outcome.status)}
                          {outcome.status}
                        </span>
                      </Badge>
                    </div>
                    <CardDescription>
                      Outcome ID: {outcome.id} • Patient: {outcome.patientId}
                    </CardDescription>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Treatment Type</div>
                      <div className="font-medium">{outcome.treatmentType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Duration</div>
                      <div className="font-medium">{outcome.duration}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">NIHSS Admission</div>
                      <div className="text-xl font-bold">{outcome.nihssAdmission}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">NIHSS Current</div>
                      <div className="text-xl font-bold">{outcome.nihssCurrent}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Improvement</div>
                      <div className={`text-xl font-bold ${getImprovementColor(outcome.improvement)}`}>
                        {outcome.improvement}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Complications</div>
                      <div className="text-sm font-medium">{outcome.complications}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Treatment Start</div>
                      <div className="font-medium">{outcome.startDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Next Review</div>
                      <div className="font-medium">{outcome.nextReview}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

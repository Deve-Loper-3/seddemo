"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const AI_DIAGNOSES = [
  {
    id: "AI-2024-087",
    patientId: "PC-2024-001",
    patientName: "John Anderson",
    scanDate: "2024-01-15 08:30",
    aiPrediction: "Ischemic Stroke - Large Vessel Occlusion",
    confidence: 96.8,
    status: "Confirmed",
    affectedRegion: "Left MCA Territory",
    volumeEstimate: "45 mL",
  },
  {
    id: "AI-2024-088",
    patientId: "PC-2024-002",
    patientName: "Maria Garcia",
    scanDate: "2024-01-14 14:15",
    aiPrediction: "Ischemic Stroke - Small Vessel Disease",
    confidence: 89.2,
    status: "Pending Review",
    affectedRegion: "Right Basal Ganglia",
    volumeEstimate: "8 mL",
  },
  {
    id: "AI-2024-089",
    patientId: "PC-2024-003",
    patientName: "Robert Chen",
    scanDate: "2024-01-13 10:45",
    aiPrediction: "Ischemic Stroke - Cardioembolic",
    confidence: 94.5,
    status: "Confirmed",
    affectedRegion: "Right MCA Territory",
    volumeEstimate: "78 mL",
  },
  {
    id: "AI-2024-090",
    patientId: "PC-2024-004",
    patientName: "Sarah Williams",
    scanDate: "2024-01-12 16:20",
    aiPrediction: "Ischemic Stroke - Lacunar",
    confidence: 91.7,
    status: "Confirmed",
    affectedRegion: "Left Internal Capsule",
    volumeEstimate: "5 mL",
  },
  {
    id: "AI-2024-091",
    patientId: "PC-2024-005",
    patientName: "David Thompson",
    scanDate: "2024-01-11 09:00",
    aiPrediction: "Ischemic Stroke - Large Vessel Occlusion",
    confidence: 87.3,
    status: "Needs Clarification",
    affectedRegion: "Left ACA Territory",
    volumeEstimate: "32 mL",
  },
]

export default function AIDiagnosesPage() {
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
      case "Confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "Needs Clarification":
        return <AlertTriangle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "default"
      case "Pending Review":
        return "secondary"
      case "Needs Clarification":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600"
    if (confidence >= 90) return "text-blue-600"
    if (confidence >= 85) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Diagnoses</h1>
            <p className="text-muted-foreground">
              Review AI-generated stroke classifications • Logged in as: {userEmail}
            </p>
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
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Total Diagnoses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">92.1%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {AI_DIAGNOSES.map((diagnosis) => (
            <Card key={diagnosis.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{diagnosis.patientName}</CardTitle>
                      <Badge variant={getStatusVariant(diagnosis.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(diagnosis.status)}
                          {diagnosis.status}
                        </span>
                      </Badge>
                    </div>
                    <CardDescription>
                      Diagnosis ID: {diagnosis.id} • Patient: {diagnosis.patientId}
                    </CardDescription>
                  </div>
                  <Button size="sm">Review Scan</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">AI Prediction</div>
                      <div className="font-medium">{diagnosis.aiPrediction}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Confidence Score</div>
                      <div className={`font-bold text-lg ${getConfidenceColor(diagnosis.confidence)}`}>
                        {diagnosis.confidence}%
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Scan Date</div>
                      <div className="font-medium">{diagnosis.scanDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Affected Region</div>
                      <div className="font-medium">{diagnosis.affectedRegion}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Volume Estimate</div>
                      <div className="font-medium">{diagnosis.volumeEstimate}</div>
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

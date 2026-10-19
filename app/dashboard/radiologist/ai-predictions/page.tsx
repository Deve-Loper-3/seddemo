"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Brain, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const AI_PREDICTIONS = [
  {
    id: "PRED-2024-089",
    patientId: "PT-8821",
    scanId: "MRI-2024-001",
    prediction: "Acute Ischemic Stroke",
    confidence: 0.92,
    region: "Left MCA Territory",
    volume: "24.3 mL",
    validated: null,
    timestamp: "2024-01-15 09:23",
  },
  {
    id: "PRED-2024-088",
    patientId: "PT-8822",
    scanId: "MRI-2024-002",
    prediction: "Chronic Infarct",
    confidence: 0.88,
    region: "Right Frontal Lobe",
    volume: "12.7 mL",
    validated: "confirmed",
    timestamp: "2024-01-15 08:45",
  },
  {
    id: "PRED-2024-087",
    patientId: "PT-8823",
    scanId: "MRI-2024-003",
    prediction: "Acute Ischemic Stroke",
    confidence: 0.95,
    region: "Bilateral Watershed",
    volume: "31.8 mL",
    validated: null,
    timestamp: "2024-01-14 16:12",
  },
  {
    id: "PRED-2024-086",
    patientId: "PT-8824",
    scanId: "MRI-2024-004",
    prediction: "Subacute Infarct",
    confidence: 0.79,
    region: "Left Parietal",
    volume: "8.4 mL",
    validated: null,
    timestamp: "2024-01-14 14:33",
  },
  {
    id: "PRED-2024-085",
    patientId: "PT-8825",
    scanId: "MRI-2024-005",
    prediction: "No Acute Findings",
    confidence: 0.91,
    region: "N/A",
    volume: "0 mL",
    validated: "confirmed",
    timestamp: "2024-01-13 11:20",
  },
  {
    id: "PRED-2024-084",
    patientId: "PT-8826",
    scanId: "MRI-2024-006",
    prediction: "Acute Ischemic Stroke",
    confidence: 0.67,
    region: "Right Occipital",
    volume: "5.2 mL",
    validated: "rejected",
    timestamp: "2024-01-13 10:05",
  },
]

export default function AIPredictionsPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "radiologist") {
      router.push("/login")
    }
  }, [router])

  const pendingValidation = AI_PREDICTIONS.filter((p) => p.validated === null).length
  const confirmed = AI_PREDICTIONS.filter((p) => p.validated === "confirmed").length
  const rejected = AI_PREDICTIONS.filter((p) => p.validated === "rejected").length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/radiologist">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Predictions</h1>
        </div>
        <p className="text-muted-foreground mb-8">Validate AI-generated stroke detections</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{pendingValidation}</div>
                  <div className="text-sm text-muted-foreground">Pending Validation</div>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{confirmed}</div>
                  <div className="text-sm text-muted-foreground">Confirmed</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{rejected}</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictions List */}
        <div className="space-y-4">
          {AI_PREDICTIONS.map((pred) => (
            <Card key={pred.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pred.id}</CardTitle>
                    <CardDescription>
                      Patient: {pred.patientId} • Scan: {pred.scanId}
                    </CardDescription>
                  </div>
                  {pred.validated === null ? (
                    <Badge variant="outline">Pending</Badge>
                  ) : pred.validated === "confirmed" ? (
                    <Badge className="bg-green-500">Confirmed</Badge>
                  ) : (
                    <Badge variant="destructive">Rejected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Prediction</div>
                    <div className="text-sm text-muted-foreground">{pred.prediction}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Confidence</div>
                    <div className="text-sm text-muted-foreground">
                      {(pred.confidence * 100).toFixed(1)}%
                      {pred.confidence < 0.8 && <span className="ml-2 text-orange-500 text-xs">(Low confidence)</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Region</div>
                    <div className="text-sm text-muted-foreground">{pred.region}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Estimated Volume</div>
                    <div className="text-sm text-muted-foreground">{pred.volume}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium mb-1">Timestamp</div>
                    <div className="text-sm text-muted-foreground">{pred.timestamp}</div>
                  </div>
                </div>
                {pred.validated === null && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

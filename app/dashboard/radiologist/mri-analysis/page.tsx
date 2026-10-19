"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, ScanLine, Brain, CheckCircle, Clock } from "lucide-react"

const MRI_SCANS = [
  {
    id: "MRI-2024-001",
    patientId: "PT-8821",
    scanDate: "2024-01-15",
    scanType: "DWI/ADC",
    status: "pending-review",
    aiDetection: "Acute Ischemic Stroke",
    confidence: 0.92,
    region: "Left MCA Territory",
    slices: 24,
    annotations: 0,
  },
  {
    id: "MRI-2024-002",
    patientId: "PT-8822",
    scanDate: "2024-01-15",
    scanType: "FLAIR",
    status: "reviewed",
    aiDetection: "Chronic Infarct",
    confidence: 0.88,
    region: "Right Frontal Lobe",
    slices: 28,
    annotations: 3,
  },
  {
    id: "MRI-2024-003",
    patientId: "PT-8823",
    scanDate: "2024-01-14",
    scanType: "DWI/ADC",
    status: "pending-review",
    aiDetection: "Acute Ischemic Stroke",
    confidence: 0.95,
    region: "Bilateral Watershed",
    slices: 32,
    annotations: 0,
  },
  {
    id: "MRI-2024-004",
    patientId: "PT-8824",
    scanDate: "2024-01-14",
    scanType: "T2-weighted",
    status: "in-progress",
    aiDetection: "Subacute Infarct",
    confidence: 0.79,
    region: "Left Parietal",
    slices: 26,
    annotations: 1,
  },
  {
    id: "MRI-2024-005",
    patientId: "PT-8825",
    scanDate: "2024-01-13",
    scanType: "DWI/ADC",
    status: "reviewed",
    aiDetection: "No Acute Findings",
    confidence: 0.91,
    region: "N/A",
    slices: 30,
    annotations: 2,
  },
]

export default function MRIAnalysisPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "radiologist") {
      router.push("/login")
    }
  }, [router])

  const pendingScans = MRI_SCANS.filter((s) => s.status === "pending-review").length
  const reviewedToday = MRI_SCANS.filter((s) => s.status === "reviewed").length
  const avgConfidence = ((MRI_SCANS.reduce((acc, s) => acc + s.confidence, 0) / MRI_SCANS.length) * 100).toFixed(1)

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
          <ScanLine className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">MRI Analysis</h1>
        </div>
        <p className="text-muted-foreground mb-8">Review and annotate MRI scan images</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{pendingScans}</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{reviewedToday}</div>
                  <div className="text-sm text-muted-foreground">Reviewed Today</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{avgConfidence}%</div>
                  <div className="text-sm text-muted-foreground">Avg AI Confidence</div>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MRI Scans List */}
        <div className="space-y-4">
          {MRI_SCANS.map((scan) => (
            <Card key={scan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{scan.id}</CardTitle>
                    <CardDescription>
                      Patient: {scan.patientId} • {scan.scanDate}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      scan.status === "reviewed" ? "default" : scan.status === "in-progress" ? "secondary" : "outline"
                    }
                  >
                    {scan.status === "pending-review"
                      ? "Pending Review"
                      : scan.status === "in-progress"
                        ? "In Progress"
                        : "Reviewed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Scan Type</div>
                    <div className="text-sm text-muted-foreground">{scan.scanType}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Slices</div>
                    <div className="text-sm text-muted-foreground">{scan.slices} slices</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">AI Detection</div>
                    <div className="text-sm text-muted-foreground">{scan.aiDetection}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Confidence</div>
                    <div className="text-sm text-muted-foreground">{(scan.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Region</div>
                    <div className="text-sm text-muted-foreground">{scan.region}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Annotations</div>
                    <div className="text-sm text-muted-foreground">{scan.annotations} annotations</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <ScanLine className="h-4 w-4 mr-2" />
                    View Scan
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Add Annotation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

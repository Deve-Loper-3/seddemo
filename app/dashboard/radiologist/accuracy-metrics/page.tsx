"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react"

const METRICS_DATA = {
  overall: {
    accuracy: 94.2,
    sensitivity: 92.8,
    specificity: 95.6,
    precision: 91.4,
    f1Score: 92.1,
  },
  byStrokeType: [
    { type: "Acute Ischemic", accuracy: 95.3, cases: 342, truePositives: 326, falsePositives: 8, falseNegatives: 8 },
    { type: "Chronic Infarct", accuracy: 93.1, cases: 198, truePositives: 184, falsePositives: 12, falseNegatives: 2 },
    { type: "Subacute Infarct", accuracy: 89.7, cases: 124, truePositives: 111, falsePositives: 9, falseNegatives: 4 },
    { type: "Hemorrhagic", accuracy: 96.8, cases: 87, truePositives: 84, falsePositives: 2, falseNegatives: 1 },
  ],
  monthlyTrend: [
    { month: "Aug 2023", accuracy: 91.2 },
    { month: "Sep 2023", accuracy: 92.1 },
    { month: "Oct 2023", accuracy: 92.8 },
    { month: "Nov 2023", accuracy: 93.4 },
    { month: "Dec 2023", accuracy: 93.9 },
    { month: "Jan 2024", accuracy: 94.2 },
  ],
}

export default function AccuracyMetricsPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "radiologist") {
      router.push("/login")
    }
  }, [router])

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
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Accuracy Metrics</h1>
        </div>
        <p className="text-muted-foreground mb-8">Monitor AI system performance</p>

        {/* Overall Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Performance Metrics</CardTitle>
            <CardDescription>System-wide AI accuracy statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{METRICS_DATA.overall.accuracy}%</div>
                <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{METRICS_DATA.overall.sensitivity}%</div>
                <div className="text-sm text-muted-foreground mt-1">Sensitivity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{METRICS_DATA.overall.specificity}%</div>
                <div className="text-sm text-muted-foreground mt-1">Specificity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{METRICS_DATA.overall.precision}%</div>
                <div className="text-sm text-muted-foreground mt-1">Precision</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{METRICS_DATA.overall.f1Score}%</div>
                <div className="text-sm text-muted-foreground mt-1">F1 Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* By Stroke Type */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance by Stroke Type</CardTitle>
            <CardDescription>Breakdown of accuracy metrics by classification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {METRICS_DATA.byStrokeType.map((item) => (
                <div key={item.type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">{item.type}</div>
                    <div className="text-2xl font-bold text-primary">{item.accuracy}%</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Cases</div>
                      <div className="font-medium">{item.cases}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">True Positives</div>
                      <div className="font-medium text-green-600">{item.truePositives}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">False Positives</div>
                      <div className="font-medium text-orange-600">{item.falsePositives}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">False Negatives</div>
                      <div className="font-medium text-red-600">{item.falseNegatives}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Trend</CardTitle>
            <CardDescription>6-month performance improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {METRICS_DATA.monthlyTrend.map((item, index) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary flex items-center justify-end pr-3 text-sm font-medium text-white"
                        style={{ width: `${item.accuracy}%` }}
                      >
                        {item.accuracy}%
                      </div>
                    </div>
                  </div>
                  {index === METRICS_DATA.monthlyTrend.length - 1 && <TrendingUp className="h-5 w-5 text-green-500" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

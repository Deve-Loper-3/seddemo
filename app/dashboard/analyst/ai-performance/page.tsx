"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Brain, Target, TrendingUp, AlertCircle } from "lucide-react"

const PERFORMANCE_METRICS = {
  overall: {
    accuracy: 94.2,
    sensitivity: 92.8,
    specificity: 95.6,
    precision: 91.4,
    recall: 92.8,
    f1Score: 92.1,
    auc: 0.967,
  },
  confusionMatrix: {
    truePositive: 1089,
    trueNegative: 82,
    falsePositive: 38,
    falseNegative: 38,
  },
}

const MODEL_VERSIONS = [
  { version: "v1.0", date: "2023-08-01", accuracy: 89.3, auc: 0.921 },
  { version: "v1.1", date: "2023-09-15", accuracy: 91.2, auc: 0.938 },
  { version: "v1.2", date: "2023-11-01", accuracy: 92.8, auc: 0.951 },
  { version: "v2.0", date: "2024-01-01", accuracy: 94.2, auc: 0.967 },
]

export default function AIPerformancePage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "analyst") {
      router.push("/login")
    }
  }, [router])

  const { truePositive, trueNegative, falsePositive, falseNegative } = PERFORMANCE_METRICS.confusionMatrix
  const total = truePositive + trueNegative + falsePositive + falseNegative

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/analyst">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Performance</h1>
        </div>
        <p className="text-muted-foreground mb-8">Evaluate model accuracy and metrics</p>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{PERFORMANCE_METRICS.overall.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{PERFORMANCE_METRICS.overall.auc}</div>
                  <div className="text-sm text-muted-foreground">AUC-ROC</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{PERFORMANCE_METRICS.overall.sensitivity}%</div>
                  <div className="text-sm text-muted-foreground">Sensitivity</div>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{PERFORMANCE_METRICS.overall.specificity}%</div>
                  <div className="text-sm text-muted-foreground">Specificity</div>
                </div>
                <AlertCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Performance Metrics</CardTitle>
            <CardDescription>Comprehensive evaluation of model performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Precision (PPV)</div>
                  <div className="text-2xl font-bold">{PERFORMANCE_METRICS.overall.precision}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Recall (Sensitivity)</div>
                  <div className="text-2xl font-bold">{PERFORMANCE_METRICS.overall.recall}%</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">F1 Score</div>
                  <div className="text-2xl font-bold">{PERFORMANCE_METRICS.overall.f1Score}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Specificity (TNR)</div>
                  <div className="text-2xl font-bold">{PERFORMANCE_METRICS.overall.specificity}%</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">AUC-ROC</div>
                  <div className="text-2xl font-bold">{PERFORMANCE_METRICS.overall.auc}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Cases</div>
                  <div className="text-2xl font-bold">{total}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confusion Matrix */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>Classification results breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="border-2 border-green-500 rounded-lg p-6 text-center bg-green-50 dark:bg-green-950">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{truePositive}</div>
                <div className="text-sm font-medium mt-2">True Positive</div>
                <div className="text-xs text-muted-foreground mt-1">Correctly identified strokes</div>
              </div>
              <div className="border-2 border-orange-500 rounded-lg p-6 text-center bg-orange-50 dark:bg-orange-950">
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{falsePositive}</div>
                <div className="text-sm font-medium mt-2">False Positive</div>
                <div className="text-xs text-muted-foreground mt-1">Incorrectly flagged as stroke</div>
              </div>
              <div className="border-2 border-red-500 rounded-lg p-6 text-center bg-red-50 dark:bg-red-950">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{falseNegative}</div>
                <div className="text-sm font-medium mt-2">False Negative</div>
                <div className="text-xs text-muted-foreground mt-1">Missed stroke cases</div>
              </div>
              <div className="border-2 border-blue-500 rounded-lg p-6 text-center bg-blue-50 dark:bg-blue-950">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{trueNegative}</div>
                <div className="text-sm font-medium mt-2">True Negative</div>
                <div className="text-xs text-muted-foreground mt-1">Correctly identified no stroke</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Version History */}
        <Card>
          <CardHeader>
            <CardTitle>Model Version History</CardTitle>
            <CardDescription>Performance improvements over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MODEL_VERSIONS.map((version, index) => (
                <div key={version.version} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold">{version.version}</div>
                      <div className="text-sm text-muted-foreground">{version.date}</div>
                    </div>
                    {index === MODEL_VERSIONS.length - 1 && (
                      <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        Current
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                      <div className="text-xl font-bold text-primary">{version.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">AUC-ROC</div>
                      <div className="text-xl font-bold text-primary">{version.auc}</div>
                    </div>
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

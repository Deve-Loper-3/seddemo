"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, BarChart3, PieChart } from "lucide-react"

const STROKE_DISTRIBUTION = [
  { type: "Acute Ischemic", count: 542, percentage: 43.5 },
  { type: "Chronic Infarct", count: 298, percentage: 23.9 },
  { type: "Subacute Infarct", count: 187, percentage: 15.0 },
  { type: "Hemorrhagic", count: 134, percentage: 10.7 },
  { type: "No Findings", count: 86, percentage: 6.9 },
]

const AGE_DISTRIBUTION = [
  { range: "40-49", count: 87 },
  { range: "50-59", count: 234 },
  { range: "60-69", count: 412 },
  { range: "70-79", count: 356 },
  { range: "80+", count: 158 },
]

export default function StatisticalAnalysisPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "analyst") {
      router.push("/login")
    }
  }, [router])

  const totalCases = STROKE_DISTRIBUTION.reduce((acc, s) => acc + s.count, 0)
  const maxAge = Math.max(...AGE_DISTRIBUTION.map((a) => a.count))

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
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Statistical Analysis</h1>
        </div>
        <p className="text-muted-foreground mb-8">Perform data analysis and modeling</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{totalCases}</div>
              <div className="text-sm text-muted-foreground">Total Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">67.2</div>
              <div className="text-sm text-muted-foreground">Mean Age</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">58%</div>
              <div className="text-sm text-muted-foreground">Male Patients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Institutions</div>
            </CardContent>
          </Card>
        </div>

        {/* Stroke Type Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <CardTitle>Stroke Type Distribution</CardTitle>
            </div>
            <CardDescription>Breakdown of stroke classifications in the dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {STROKE_DISTRIBUTION.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground">
                      {item.count} cases ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Patient age ranges in the study</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AGE_DISTRIBUTION.map((item) => (
                <div key={item.range} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">{item.range}</div>
                  <div className="flex-1">
                    <div className="h-10 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary flex items-center justify-end pr-4 text-sm font-medium text-white"
                        style={{ width: `${(item.count / maxAge) * 100}%` }}
                      >
                        {item.count}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistical Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Statistical Tests</CardTitle>
            <CardDescription>Key statistical findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-2">Chi-Square Test: Stroke Type vs Gender</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Testing association between stroke type and patient gender
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">χ² statistic:</span>{" "}
                    <span className="font-medium">12.47</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">p-value:</span> <span className="font-medium">0.014</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Result:</span>{" "}
                    <span className="font-medium text-green-600">Statistically significant (p &lt; 0.05)</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-2">T-Test: Age Comparison Acute vs Chronic</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Comparing mean age between acute and chronic stroke patients
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">t-statistic:</span>{" "}
                    <span className="font-medium">-3.21</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">p-value:</span> <span className="font-medium">0.002</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Result:</span>{" "}
                    <span className="font-medium text-green-600">Highly significant (p &lt; 0.01)</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-2">Correlation: NIHSS Score vs Lesion Volume</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Examining relationship between stroke severity and lesion size
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pearson r:</span> <span className="font-medium">0.78</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">p-value:</span>{" "}
                    <span className="font-medium">&lt; 0.001</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Result:</span>{" "}
                    <span className="font-medium text-green-600">Strong positive correlation</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

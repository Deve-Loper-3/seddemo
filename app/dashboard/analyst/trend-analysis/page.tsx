"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Calendar, AlertCircle } from "lucide-react"

const MONTHLY_TRENDS = [
  { month: "Aug 2023", cases: 187, avgAge: 66.2, malePercent: 56 },
  { month: "Sep 2023", cases: 203, avgAge: 67.1, malePercent: 58 },
  { month: "Oct 2023", cases: 219, avgAge: 66.8, malePercent: 57 },
  { month: "Nov 2023", cases: 198, avgAge: 67.5, malePercent: 59 },
  { month: "Dec 2023", cases: 234, avgAge: 67.3, malePercent: 58 },
  { month: "Jan 2024", cases: 206, avgAge: 67.2, malePercent: 58 },
]

const SEASONAL_PATTERNS = [
  { season: "Summer 2023", cases: 542, avgSeverity: 12.3 },
  { season: "Fall 2023", cases: 620, avgSeverity: 13.1 },
  { season: "Winter 2023-24", cases: 440, avgSeverity: 12.8 },
]

const KEY_FINDINGS = [
  {
    title: "Increasing Case Volume",
    description: "15% increase in stroke cases observed from August to December 2023",
    impact: "high",
  },
  {
    title: "Age Trend Stability",
    description: "Mean patient age remains consistent around 67 years across all months",
    impact: "medium",
  },
  {
    title: "Gender Distribution",
    description: "Male patients consistently represent 57-59% of cases",
    impact: "medium",
  },
  {
    title: "Seasonal Variation",
    description: "Fall months show 14% higher case volume compared to summer",
    impact: "high",
  },
]

export default function TrendAnalysisPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "analyst") {
      router.push("/login")
    }
  }, [router])

  const maxCases = Math.max(...MONTHLY_TRENDS.map((m) => m.cases))
  const totalCases = MONTHLY_TRENDS.reduce((acc, m) => acc + m.cases, 0)
  const avgCasesPerMonth = (totalCases / MONTHLY_TRENDS.length).toFixed(0)

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
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Trend Analysis</h1>
        </div>
        <p className="text-muted-foreground mb-8">Identify patterns in stroke data</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalCases}</div>
                  <div className="text-sm text-muted-foreground">Total Cases (6mo)</div>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{avgCasesPerMonth}</div>
                  <div className="text-sm text-muted-foreground">Avg Cases/Month</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">67.2</div>
                  <div className="text-sm text-muted-foreground">Mean Age</div>
                </div>
                <AlertCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Case Volume */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Case Volume Trend</CardTitle>
            <CardDescription>Number of stroke cases per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MONTHLY_TRENDS.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-28">{month.month}</span>
                    <span className="text-muted-foreground">{month.cases} cases</span>
                  </div>
                  <div className="h-8 bg-primary/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary flex items-center justify-end pr-4 text-sm font-medium text-white"
                      style={{ width: `${(month.cases / maxCases) * 100}%` }}
                    >
                      {month.cases}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Patterns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seasonal Patterns</CardTitle>
            <CardDescription>Case volume and severity by season</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SEASONAL_PATTERNS.map((season) => (
                <div key={season.season} className="border rounded-lg p-4">
                  <div className="font-semibold mb-3">{season.season}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Cases</div>
                      <div className="text-2xl font-bold text-primary">{season.cases}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg NIHSS Score</div>
                      <div className="text-2xl font-bold text-primary">{season.avgSeverity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
            <CardDescription>Important trends and patterns identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {KEY_FINDINGS.map((finding, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                        finding.impact === "high" ? "bg-red-500" : "bg-orange-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{finding.title}</div>
                      <div className="text-sm text-muted-foreground">{finding.description}</div>
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

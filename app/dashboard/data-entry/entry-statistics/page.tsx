"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Award } from "lucide-react"

const DAILY_STATS = [
  { date: "Mon", entries: 42 },
  { date: "Tue", entries: 38 },
  { date: "Wed", entries: 51 },
  { date: "Thu", entries: 45 },
  { date: "Fri", entries: 47 },
  { date: "Sat", entries: 28 },
  { date: "Sun", entries: 22 },
]

const MONTHLY_STATS = [
  { month: "Aug", entries: 892 },
  { month: "Sep", entries: 945 },
  { month: "Oct", entries: 1023 },
  { month: "Nov", entries: 987 },
  { month: "Dec", entries: 1156 },
  { month: "Jan", entries: 1247 },
]

export default function EntryStatisticsPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "data-entry") {
      router.push("/login")
    }
  }, [router])

  const maxDaily = Math.max(...DAILY_STATS.map((d) => d.entries))
  const maxMonthly = Math.max(...MONTHLY_STATS.map((m) => m.entries))
  const weekTotal = DAILY_STATS.reduce((acc, d) => acc + d.entries, 0)
  const avgDaily = (weekTotal / 7).toFixed(1)

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
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Entry Statistics</h1>
        </div>
        <p className="text-muted-foreground mb-8">Track data entry progress</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">47</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{weekTotal}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{avgDaily}</div>
                  <div className="text-sm text-muted-foreground">Daily Average</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">98.3%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Entries Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Entries (This Week)</CardTitle>
            <CardDescription>Number of records entered per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAILY_STATS.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{day.date}</div>
                  <div className="flex-1">
                    <div className="h-10 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary flex items-center justify-end pr-4 text-sm font-medium text-white"
                        style={{ width: `${(day.entries / maxDaily) * 100}%` }}
                      >
                        {day.entries}
                      </div>
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
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>6-month entry history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MONTHLY_STATS.map((month, index) => (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">{month.month}</div>
                  <div className="flex-1">
                    <div className="h-10 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary flex items-center justify-end pr-4 text-sm font-medium text-white"
                        style={{ width: `${(month.entries / maxMonthly) * 100}%` }}
                      >
                        {month.entries}
                      </div>
                    </div>
                  </div>
                  {index === MONTHLY_STATS.length - 1 && <TrendingUp className="h-5 w-5 text-green-500" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

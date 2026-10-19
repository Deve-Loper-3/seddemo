"use client"

import { useMemo } from "react"
import { format, startOfWeek, subWeeks } from "date-fns"
import { BarChart3 } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { ConfusionMatrix, GroupMetricChart, MetricTiles } from "@/components/charts"
import { confusion, pct, scores } from "@/lib/metrics"
import { useDB } from "@/lib/store"
import type { Scan } from "@/lib/types"

const BANDS: [string, number, number][] = [
  ["50–70%", 0.5, 0.7],
  ["70–85%", 0.7, 0.85],
  ["85–95%", 0.85, 0.95],
  ["95–100%", 0.95, 1.01],
]

export default function AccuracyMetricsPage() {
  const db = useDB()
  // AI vs radiologist read (the radiologist's own reference standard)
  const reviewed = useMemo(
    () =>
      db.scans
        .filter((s) => s.ai && s.radiologistReview)
        .map((s) => ({ ...s, expertValidation: undefined }) as Scan),
    [db.scans],
  )
  const c = confusion(reviewed)
  const s = scores(c)
  const agree = reviewed.filter((x) => x.ai!.label === x.radiologistReview!.finalLabel)

  const bySequence = ["DWI", "ADC", "T2", "T1", "MRA", "FLAIR"]
    .map((seq) => {
      const l = reviewed.filter((x) => x.sequence === seq)
      return { name: seq, value: scores(confusion(l)).accuracy, n: l.length }
    })
    .filter((d) => d.n > 0)

  const calibration = BANDS.map(([name, lo, hi]) => {
    const l = reviewed.filter((x) => x.ai!.confidence >= lo && x.ai!.confidence < hi)
    return { name, value: l.length ? l.filter((x) => x.ai!.label === x.radiologistReview!.finalLabel).length / l.length : 0, n: l.length }
  })

  const weekly = Array.from({ length: 12 }, (_, i) => {
    const start = startOfWeek(subWeeks(new Date(), 11 - i))
    const end = new Date(start.getTime() + 7 * 86_400_000)
    const l = reviewed.filter((x) => {
      const t = new Date(x.radiologistReview!.at)
      return t >= start && t < end
    })
    return {
      week: format(start, "d MMM"),
      agreement: l.length ? Math.round((l.filter((x) => x.ai!.label === x.radiologistReview!.finalLabel).length / l.length) * 1000) / 10 : null,
      reads: l.length,
    }
  })

  return (
    <div>
      <PageHeader title="Accuracy Metrics" description="AI performance measured against radiologist reads (updates as you review)" icon={BarChart3} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Radiologist reads" value={reviewed.length} />
        <StatCard label="AI–radiologist agreement" value={pct(reviewed.length ? agree.length / reviewed.length : 0)} tone="green" />
        <StatCard label="Sensitivity" value={pct(s.sensitivity)} />
        <StatCard label="Specificity" value={pct(s.specificity)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Confusion matrix</CardTitle>
            <CardDescription>AI prediction vs. radiologist final read</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfusionMatrix c={c} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTiles c={c} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by sequence</CardTitle>
            <CardDescription>Grey bars have fewer than 3 reads</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupMetricChart data={bySequence} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calibration</CardTitle>
            <CardDescription>Observed accuracy per AI confidence band</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupMetricChart data={calibration} color={CHART_COLORS[2]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly agreement</CardTitle>
            <CardDescription>Last 12 weeks</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" fontSize={10} />
                <YAxis domain={[50, 100]} fontSize={11} unit="%" />
                <Tooltip formatter={(v: number, n: string) => (n === "agreement" ? [`${v}%`, "Agreement"] : [v, n])} />
                <Line type="monotone" dataKey="agreement" stroke={CHART_COLORS[0]} strokeWidth={2} connectNulls dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

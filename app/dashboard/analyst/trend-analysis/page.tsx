"use client"

import { useMemo, useState } from "react"
import { Lightbulb, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { useDB } from "@/lib/store"
import { groundTruth, lastMonths, monthKey, patientMap } from "@/lib/metrics"

const hours = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

export default function TrendAnalysisPage() {
  const db = useDB()
  const [months, setMonths] = useState(12)
  const [site, setSite] = useState("all")
  const patients = useMemo(() => patientMap(db), [db])

  const pts = db.patients.filter((p) => site === "all" || p.site === site)
  const scans = db.scans.filter((s) => site === "all" || patients.get(s.patientId)?.site === site)

  const series = lastMonths(months).map((m) => {
    const mp = pts.filter((p) => monthKey(p.admittedAt) === m.key)
    const ms = scans.filter((s) => monthKey(s.uploadedAt) === m.key)
    const adj = ms.filter((s) => groundTruth(s))
    const pos = adj.filter((s) => groundTruth(s) === "Ischemic stroke")
    const rad = ms.filter((s) => s.radiologistReview).map((s) => hours(s.uploadedAt, s.radiologistReview!.at))
    const val = ms.filter((s) => s.expertValidation).map((s) => hours(s.uploadedAt, s.expertValidation!.at))
    const agree = adj.filter((s) => s.ai && s.ai.label === groundTruth(s))
    return {
      month: m.label,
      Patients: mp.length,
      Scans: ms.length,
      "Stroke positivity %": adj.length ? Math.round((pos.length / adj.length) * 100) : null,
      "AI accuracy %": adj.length ? Math.round((agree.length / adj.length) * 100) : null,
      "Radiologist read (h)": avg(rad) !== null ? +avg(rad)!.toFixed(1) : null,
      "Expert validation (h)": avg(val) !== null ? +avg(val)!.toFixed(1) : null,
      "Mean NIHSS": mp.length ? +avg(mp.map((p) => p.nihssAdmission))!.toFixed(1) : null,
      "Onset→scan (h)": mp.length ? +avg(mp.map((p) => p.symptomOnsetHours))!.toFixed(1) : null,
    }
  })

  const half = Math.floor(series.length / 2)
  const sum = (k: "Patients" | "Scans", from: number, to: number) => series.slice(from, to).reduce((a, r) => a + r[k], 0)
  const recent = sum("Patients", half, series.length)
  const earlier = sum("Patients", 0, half)
  const growth = earlier ? Math.round(((recent - earlier) / earlier) * 100) : 0
  const readTimes = series.map((r) => r["Radiologist read (h)"]).filter((x): x is number => x !== null)
  const accs = series.map((r) => r["AI accuracy %"]).filter((x): x is number => x !== null)

  const findings = [
    `Enrolment in the last ${months - half} months is ${growth >= 0 ? "up" : "down"} ${Math.abs(growth)}% versus the preceding ${half} months (${recent} vs ${earlier} patients).`,
    readTimes.length ? `Mean time from upload to radiologist read ranges from ${Math.min(...readTimes)} h to ${Math.max(...readTimes)} h across months.` : "Not enough radiologist reads for turnaround analysis.",
    accs.length ? `Monthly AI accuracy ranges between ${Math.min(...accs)}% and ${Math.max(...accs)}%; small monthly samples cause most of the variation.` : "No adjudicated scans in this period.",
    `${db.scans.filter((s) => s.status !== "validated").length} scans are still moving through the review pipeline and are excluded from accuracy trends.`,
  ]

  return (
    <div>
      <PageHeader
        title="Trend Analysis"
        description="Monthly patterns in enrolment, positivity, AI accuracy and turnaround"
        icon={TrendingUp}
        actions={
          <>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {db.sites.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={`Patients (${months} mo)`} value={series.reduce((a, r) => a + r.Patients, 0)} />
        <StatCard label={`Scans (${months} mo)`} value={series.reduce((a, r) => a + r.Scans, 0)} />
        <StatCard label="Enrolment trend" value={`${growth >= 0 ? "+" : ""}${growth}%`} tone={growth >= 0 ? "green" : "red"} />
        <StatCard label="Avg radiologist turnaround" value={readTimes.length ? `${avg(readTimes)!.toFixed(1)} h` : "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrolment volume</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Patients" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} />
                <Area type="monotone" dataKey="Scans" stroke={CHART_COLORS[5]} fill={CHART_COLORS[5]} fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Positivity & AI accuracy</CardTitle>
            <CardDescription>Adjudicated scans only</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis domain={[0, 100]} unit="%" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Stroke positivity %" stroke={CHART_COLORS[1]} strokeWidth={2} connectNulls />
                <Line type="monotone" dataKey="AI accuracy %" stroke={CHART_COLORS[2]} strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review turnaround</CardTitle>
            <CardDescription>Mean hours from upload</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis unit="h" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Radiologist read (h)" stroke={CHART_COLORS[3]} strokeWidth={2} connectNulls />
                <Line type="monotone" dataKey="Expert validation (h)" stroke={CHART_COLORS[4]} strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clinical presentation</CardTitle>
            <CardDescription>Mean admission NIHSS and onset-to-scan delay</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Mean NIHSS" stroke={CHART_COLORS[1]} strokeWidth={2} connectNulls />
                <Line type="monotone" dataKey="Onset→scan (h)" stroke={CHART_COLORS[7]} strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" /> Key findings
          </CardTitle>
          <CardDescription>Generated from the data above</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            {findings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

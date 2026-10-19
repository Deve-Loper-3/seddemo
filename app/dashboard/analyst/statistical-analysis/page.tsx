"use client"

import { useMemo } from "react"
import { BarChart3, Download } from "lucide-react"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { COMORBIDITY_OPTIONS } from "@/components/patient-form"
import { useDB, useStore } from "@/lib/store"
import { AGE_BANDS, ageBand, downloadFile, groundTruth, pct, toCSV } from "@/lib/metrics"
import type { Patient } from "@/lib/types"

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const sd = (xs: number[]) => {
  const m = mean(xs)
  return xs.length > 1 ? Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)) : 0
}
const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

export default function StatisticalAnalysisPage() {
  const db = useDB()
  const { can, log } = useStore()

  const { stroke, noStroke, unknown } = useMemo(() => {
    const truthOf = (p: Patient) => db.scans.filter((s) => s.patientId === p.id).map(groundTruth).find(Boolean)
    return {
      stroke: db.patients.filter((p) => truthOf(p) === "Ischemic stroke"),
      noStroke: db.patients.filter((p) => truthOf(p) === "No acute stroke"),
      unknown: db.patients.filter((p) => !truthOf(p)),
    }
  }, [db.patients, db.scans])

  const ageSex = AGE_BANDS.map((b) => ({
    band: b,
    Male: db.patients.filter((p) => ageBand(p.age) === b && p.sex === "Male").length,
    Female: db.patients.filter((p) => ageBand(p.age) === b && p.sex === "Female").length,
  }))

  const outcomePie = [
    { name: "Ischemic stroke", value: stroke.length },
    { name: "No acute stroke", value: noStroke.length },
    { name: "Not yet adjudicated", value: unknown.length },
  ]

  const subtypes = (() => {
    const m = new Map<string, number>()
    db.scans
      .filter((s) => s.ai?.subtype && groundTruth(s) === "Ischemic stroke")
      .forEach((s) => m.set(s.ai!.subtype!, (m.get(s.ai!.subtype!) ?? 0) + 1))
    return [...m.entries()].map(([name, value]) => ({ name, value }))
  })()

  const nihssHist = [
    ["0–4 minor", 0, 4],
    ["5–15 moderate", 5, 15],
    ["16–20 mod-severe", 16, 20],
    ["21–42 severe", 21, 42],
  ].map(([name, lo, hi]) => ({ name: name as string, Patients: db.patients.filter((p) => p.nihssAdmission >= (lo as number) && p.nihssAdmission <= (hi as number)).length }))

  const risk = COMORBIDITY_OPTIONS.map((c) => ({
    name: c,
    "Ischemic stroke": stroke.length ? Math.round((stroke.filter((p) => p.comorbidities.includes(c)).length / stroke.length) * 100) : 0,
    "No acute stroke": noStroke.length ? Math.round((noStroke.filter((p) => p.comorbidities.includes(c)).length / noStroke.length) * 100) : 0,
  }))

  const describe = (label: string, f: (p: Patient) => number) => {
    const all = db.patients.map(f)
    const a = stroke.map(f)
    const b = noStroke.map(f)
    const fmt = (xs: number[]) => (xs.length ? `${mean(xs).toFixed(1)} ± ${sd(xs).toFixed(1)} (median ${median(xs).toFixed(1)})` : "—")
    return { label, all: fmt(all), stroke: fmt(a), noStroke: fmt(b) }
  }
  const prop = (label: string, f: (p: Patient) => boolean) => {
    const fmt = (xs: Patient[]) => (xs.length ? `${xs.filter(f).length} (${pct(xs.filter(f).length / xs.length, 0)})` : "—")
    return { label, all: fmt(db.patients), stroke: fmt(stroke), noStroke: fmt(noStroke) }
  }
  const table1 = [
    describe("Age, years", (p) => p.age),
    prop("Male sex", (p) => p.sex === "Male"),
    describe("NIHSS on admission", (p) => p.nihssAdmission),
    describe("Onset to scan, hours", (p) => p.symptomOnsetHours),
    prop("Hypertension", (p) => p.comorbidities.includes("Hypertension")),
    prop("Diabetes mellitus", (p) => p.comorbidities.includes("Diabetes mellitus")),
    prop("Atrial fibrillation", (p) => p.comorbidities.includes("Atrial fibrillation")),
  ]

  const exportTable = () => {
    if (!can("export_data")) return toast.error("Your role lacks the export permission")
    downloadFile(
      "table1-baseline-characteristics.csv",
      toCSV(table1.map((r) => ({ characteristic: r.label, [`all (n=${db.patients.length})`]: r.all, [`ischemic (n=${stroke.length})`]: r.stroke, [`no stroke (n=${noStroke.length})`]: r.noStroke }))),
      "text/csv",
    )
    log("export_data", "Exported Table 1 baseline characteristics")
    toast.success("Table 1 exported")
  }

  return (
    <div>
      <PageHeader title="Statistical Analysis" description="Cohort demographics, risk factors and severity" icon={BarChart3} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cohort size" value={db.patients.length} />
        <StatCard label="Confirmed ischemic stroke" value={stroke.length} tone="red" />
        <StatCard label="Stroke mimics / normal" value={noStroke.length} />
        <StatCard label="Mean NIHSS (stroke)" value={mean(stroke.map((p) => p.nihssAdmission)).toFixed(1)} tone="orange" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Table 1 – Baseline characteristics</CardTitle>
              <CardDescription>Mean ± SD (median) or n (%) · grouped by adjudicated diagnosis</CardDescription>
            </div>
            <Button variant="outline" onClick={exportTable}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Characteristic</TableHead>
                <TableHead>All (n={db.patients.length})</TableHead>
                <TableHead>Ischemic stroke (n={stroke.length})</TableHead>
                <TableHead>No acute stroke (n={noStroke.length})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table1.map((r) => (
                <TableRow key={r.label}>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell>{r.all}</TableCell>
                  <TableCell>{r.stroke}</TableCell>
                  <TableCell>{r.noStroke}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Age and sex distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageSex}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="band" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Male" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Female" fill={CHART_COLORS[6]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Adjudicated diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={outcomePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {outcomePie.map((_, i) => (
                    <Cell key={i} fill={[CHART_COLORS[1], CHART_COLORS[0], "#cbd5e1"][i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk factor prevalence</CardTitle>
            <CardDescription>% of patients in each diagnostic group</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risk} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="%" fontSize={11} />
                <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
                <Bar dataKey="Ischemic stroke" fill={CHART_COLORS[1]} radius={[0, 3, 3, 0]} />
                <Bar dataKey="No acute stroke" fill={CHART_COLORS[0]} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stroke severity (NIHSS)</CardTitle>
            </CardHeader>
            <CardContent className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nihssHist}>
                  <XAxis dataKey="name" fontSize={9} />
                  <YAxis allowDecimals={false} fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="Patients" fill={CHART_COLORS[3]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ischemic subtypes (AI)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {subtypes.map((s, i) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                      {s.name}
                    </span>
                    <span className="tabular-nums font-medium">{s.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

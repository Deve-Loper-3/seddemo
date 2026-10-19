"use client"

import { useMemo } from "react"
import { format, subDays } from "date-fns"
import { BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { groupCount, lastMonths, monthKey } from "@/lib/metrics"

export default function EntryStatisticsPage() {
  const db = useDB()
  const { user } = useStore()

  const daily = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i)
      const key = d.toDateString()
      return {
        day: format(d, "d MMM"),
        Patients: db.patients.filter((p) => new Date(p.createdAt).toDateString() === key).length,
        Scans: db.scans.filter((s) => new Date(s.uploadedAt).toDateString() === key).length,
      }
    })
  }, [db.patients, db.scans])

  const monthly = useMemo(
    () =>
      lastMonths(6).map((m) => ({
        month: m.label,
        Patients: db.patients.filter((p) => monthKey(p.createdAt) === m.key).length,
        Scans: db.scans.filter((s) => monthKey(s.uploadedAt) === m.key).length,
      })),
    [db.patients, db.scans],
  )

  const bySite = groupCount(db.patients, (p) => p.site.split(" – ")[0]).sort((a, b) => a.name.localeCompare(b.name))
  const byStaff = groupCount(db.patients, (p) => p.createdBy).sort((a, b) => b.value - a.value)

  const n = db.patients.length || 1
  const discharged = db.patients.filter((p) => p.status !== "Admitted")
  const fu = db.patients.filter((p) => Date.now() - new Date(p.admittedAt).getTime() > 90 * 86_400_000)
  const completeness = [
    { field: "Demographics", pct: 100 },
    { field: "Admission NIHSS", pct: (db.patients.filter((p) => p.nihssAdmission >= 0).length / n) * 100 },
    { field: "MRI uploaded", pct: (db.patients.filter((p) => db.scans.some((s) => s.patientId === p.id)).length / n) * 100 },
    { field: "Treatment (discharged)", pct: (discharged.filter((p) => p.treatment).length / (discharged.length || 1)) * 100 },
    { field: "Discharge NIHSS", pct: (discharged.filter((p) => p.nihssDischarge !== undefined).length / (discharged.length || 1)) * 100 },
    { field: "90-day mRS (eligible)", pct: (fu.filter((p) => p.mrs90 !== undefined).length / (fu.length || 1)) * 100 },
  ]

  const last7 = daily.slice(-7).reduce((a, d) => a + d.Patients + d.Scans, 0)

  return (
    <div>
      <PageHeader title="Entry Statistics" description="Data entry throughput and record completeness" icon={BarChart3} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Records entered (7 days)" value={last7} />
        <StatCard label="My patient entries" value={db.patients.filter((p) => p.createdBy === user?.name).length} />
        <StatCard label="My scan uploads" value={db.scans.filter((s) => s.uploadedBy === user?.name).length} />
        <StatCard
          label="Overall completeness"
          value={`${Math.round(completeness.reduce((a, c) => a + c.pct, 0) / completeness.length)}%`}
          tone="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Last 14 days</CardTitle>
            <CardDescription>New patients and scan uploads per day</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Patients" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Scans" fill={CHART_COLORS[5]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly volume</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Patients" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Scans" fill={CHART_COLORS[5]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Field completeness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completeness.map((c) => (
              <div key={c.field}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{c.field}</span>
                  <span className="font-medium tabular-nums">{c.pct.toFixed(0)}%</span>
                </div>
                <Progress value={c.pct} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patients by site</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySite} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="name" width={60} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" name="Patients" fill={CHART_COLORS[0]} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Entries by staff member</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {byStaff.map((s) => (
                <li key={s.name} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className={s.name === user?.name ? "font-semibold" : ""}>
                      {s.name}
                      {s.name === user?.name && " (you)"}
                    </span>
                    <span className="tabular-nums">{s.value}</span>
                  </div>
                  <Progress value={(s.value / (byStaff[0]?.value || 1)) * 100} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { HeartPulse } from "lucide-react"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { TREATMENT_OPTIONS } from "@/components/patient-form"
import { useDB, useStore } from "@/lib/store"
import { fmtDate, pct } from "@/lib/metrics"
import type { Patient, Treatment } from "@/lib/types"

const MRS_LABELS = ["0 – No symptoms", "1 – No significant disability", "2 – Slight disability", "3 – Moderate disability", "4 – Moderately severe", "5 – Severe disability", "6 – Dead"]

export default function TreatmentOutcomesPage() {
  const db = useDB()
  const { updatePatient } = useStore()
  const [editing, setEditing] = useState<Patient | null>(null)
  const [form, setForm] = useState<{ treatment?: Treatment; nihssDischarge: string; mrs90: string; status: Patient["status"] }>({
    nihssDischarge: "",
    mrs90: "",
    status: "Discharged",
  })

  const treated = db.patients.filter((p) => p.treatment)
  const withMrs = treated.filter((p) => p.mrs90 !== undefined)

  const byTreatment = useMemo(
    () =>
      TREATMENT_OPTIONS.map((t) => {
        const l = db.patients.filter((p) => p.treatment === t)
        const m = l.filter((p) => p.mrs90 !== undefined)
        const d = l.filter((p) => p.nihssDischarge !== undefined)
        return {
          name: t.replace(" (tPA)", "").replace("Antiplatelet / supportive", "Supportive"),
          full: t,
          n: l.length,
          nihssAdm: l.length ? l.reduce((a, p) => a + p.nihssAdmission, 0) / l.length : 0,
          nihssDis: d.length ? d.reduce((a, p) => a + (p.nihssDischarge ?? 0), 0) / d.length : 0,
          good: m.length ? m.filter((p) => p.mrs90! <= 2).length / m.length : 0,
          mortality: m.length ? m.filter((p) => p.mrs90 === 6).length / m.length : 0,
          los: l.length ? l.reduce((a, p) => a + (p.lengthOfStayDays ?? 0), 0) / l.length : 0,
          mrsN: m.length,
        }
      }),
    [db.patients],
  )

  const mrsDist = TREATMENT_OPTIONS.map((t) => {
    const row: Record<string, number | string> = { name: t.replace(" (tPA)", "").replace("Antiplatelet / supportive", "Supportive") }
    const l = db.patients.filter((p) => p.treatment === t && p.mrs90 !== undefined)
    for (let i = 0; i <= 6; i++) row[`mRS ${i}`] = l.length ? Math.round((l.filter((p) => p.mrs90 === i).length / l.length) * 100) : 0
    return row
  })

  const missing = db.patients
    .filter((p) => p.status !== "Admitted" && (p.mrs90 === undefined || !p.treatment))
    .concat(db.patients.filter((p) => p.status === "Admitted" && Date.now() - new Date(p.admittedAt).getTime() > 5 * 86_400_000))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .sort((a, b) => a.admittedAt.localeCompare(b.admittedAt))

  const startEdit = (p: Patient) => {
    setEditing(p)
    setForm({
      treatment: p.treatment,
      nihssDischarge: p.nihssDischarge?.toString() ?? "",
      mrs90: p.mrs90?.toString() ?? "",
      status: p.status === "Admitted" ? "Discharged" : p.status,
    })
  }

  const save = () => {
    if (!editing) return
    const mrs = form.mrs90 === "" ? undefined : Number(form.mrs90)
    const nd = form.nihssDischarge === "" ? undefined : Number(form.nihssDischarge)
    if (mrs !== undefined && !(mrs >= 0 && mrs <= 6)) return toast.error("mRS must be 0–6")
    if (nd !== undefined && !(nd >= 0 && nd <= 42)) return toast.error("NIHSS must be 0–42")
    updatePatient(editing.id, {
      treatment: form.treatment,
      nihssDischarge: nd,
      mrs90: mrs,
      status: mrs === 6 ? "Deceased" : mrs !== undefined ? "Follow-up" : form.status,
    })
    toast.success(`Outcome recorded for ${editing.id}`)
    setEditing(null)
  }

  return (
    <div>
      <PageHeader title="Treatment Outcomes" description="Functional outcomes by treatment pathway" icon={HeartPulse} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Patients with treatment recorded" value={treated.length} />
        <StatCard label="Good outcome (mRS 0–2)" value={pct(withMrs.length ? withMrs.filter((p) => p.mrs90! <= 2).length / withMrs.length : 0)} tone="green" />
        <StatCard label="90-day mortality" value={pct(withMrs.length ? withMrs.filter((p) => p.mrs90 === 6).length / withMrs.length : 0)} tone="red" />
        <StatCard label="Outcome data pending" value={missing.length} tone="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>NIHSS: admission vs. discharge</CardTitle>
            <CardDescription>Mean scores per treatment pathway (lower is better)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTreatment}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: number) => v.toFixed(1)} />
                <Legend />
                <Bar dataKey="nihssAdm" name="Admission" fill={CHART_COLORS[1]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="nihssDis" name="Discharge" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>90-day mRS distribution</CardTitle>
            <CardDescription>% of patients per mRS grade</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mrsDist} layout="vertical" stackOffset="expand">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} fontSize={11} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {Array.from({ length: 7 }, (_, i) => (
                  <Bar key={i} dataKey={`mRS ${i}`} stackId="a" fill={["#15803d", "#22c55e", "#86efac", "#fde047", "#fb923c", "#ef4444", "#1f2937"][i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Outcomes summary</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatment</TableHead>
                <TableHead>n</TableHead>
                <TableHead>Mean NIHSS change</TableHead>
                <TableHead>mRS 0–2</TableHead>
                <TableHead>Mortality</TableHead>
                <TableHead>Mean stay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byTreatment.map((t) => (
                <TableRow key={t.full}>
                  <TableCell className="font-medium">{t.full}</TableCell>
                  <TableCell>{t.n}</TableCell>
                  <TableCell className="text-emerald-700">{t.n ? `−${(t.nihssAdm - t.nihssDis).toFixed(1)}` : "—"}</TableCell>
                  <TableCell>{t.mrsN ? pct(t.good) : "—"}</TableCell>
                  <TableCell>{t.mrsN ? pct(t.mortality) : "—"}</TableCell>
                  <TableCell>{t.n ? `${t.los.toFixed(1)} d` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outcome data to complete ({missing.length})</CardTitle>
          <CardDescription>Discharged patients without treatment or 90-day mRS, and long admissions</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Admitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>mRS</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {missing.slice(0, 20).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </TableCell>
                  <TableCell className="text-sm">{fmtDate(p.admittedAt)}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell className="text-sm">{p.treatment ?? <span className="text-amber-600">missing</span>}</TableCell>
                  <TableCell>{p.mrs90 ?? <span className="text-amber-600">missing</span>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => startEdit(p)}>
                      Record outcome
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {missing.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    All outcome data is complete.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record outcome – {editing?.name}</DialogTitle>
            <DialogDescription>
              {editing?.id} · NIHSS on admission {editing?.nihssAdmission}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Treatment</Label>
              <Select value={form.treatment ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, treatment: v as Treatment }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select treatment…" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nd">NIHSS at discharge</Label>
                <Input id="nd" type="number" value={form.nihssDischarge} onChange={(e) => setForm((f) => ({ ...f, nihssDischarge: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Patient["status"] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Admitted", "Discharged", "Follow-up", "Deceased"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>90-day modified Rankin Scale</Label>
              <Select value={form.mrs90} onValueChange={(v) => setForm((f) => ({ ...f, mrs90: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Not yet available" />
                </SelectTrigger>
                <SelectContent>
                  {MRS_LABELS.map((l, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

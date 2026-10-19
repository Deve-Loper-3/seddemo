"use client"

import { useMemo, useState } from "react"
import { ClipboardList, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/dashboard-shell"
import { LabelBadge, StatCard, StatusBadge } from "@/components/common"
import { PatientDetailDialog } from "@/components/patient-detail"
import { useDB } from "@/lib/store"
import { fmtDate, groundTruth } from "@/lib/metrics"
import type { Patient } from "@/lib/types"

export default function PatientRecordsPage() {
  const db = useDB()
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState("all")
  const [viewing, setViewing] = useState<Patient | null>(null)
  const [limit, setLimit] = useState(15)

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase()
    return db.patients
      .map((p) => {
        const scans = db.scans.filter((s) => s.patientId === p.id)
        const truth = scans.map(groundTruth).find(Boolean)
        return { p, scans, truth }
      })
      .filter(({ p }) => !n || `${p.id} ${p.name} ${p.site} ${p.presentingSymptoms}`.toLowerCase().includes(n))
      .filter(({ scans, truth }) => {
        if (filter === "awaiting") return scans.some((s) => s.status === "pending-validation")
        if (filter === "stroke") return truth === "Ischemic stroke"
        if (filter === "no-stroke") return truth === "No acute stroke"
        return true
      })
      .sort((a, b) => b.p.admittedAt.localeCompare(a.p.admittedAt))
  }, [db.patients, db.scans, q, filter])

  return (
    <div>
      <PageHeader title="Patient Records" description="Clinical details, imaging and review history for enrolled patients" icon={ClipboardList} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Patients" value={db.patients.length} />
        <StatCard label="Currently admitted" value={db.patients.filter((p) => p.status === "Admitted").length} />
        <StatCard label="Mean NIHSS" value={(db.patients.reduce((a, p) => a + p.nihssAdmission, 0) / (db.patients.length || 1)).toFixed(1)} />
        <StatCard label="Mean age" value={(db.patients.reduce((a, p) => a + p.age, 0) / (db.patients.length || 1)).toFixed(0)} />
      </div>

      <div className="flex flex-col gap-2 md:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by ID, name, site or symptom…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All patients</SelectItem>
            <SelectItem value="awaiting">With scans awaiting validation</SelectItem>
            <SelectItem value="stroke">Confirmed ischemic stroke</SelectItem>
            <SelectItem value="no-stroke">Confirmed no acute stroke</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {rows.slice(0, limit).map(({ p, scans, truth }) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center">
              <div className="flex -space-x-3">
                {scans.slice(0, 3).map((s) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={s.id} src={s.image} alt="" className="h-14 w-14 rounded-md border-2 border-background object-cover bg-black" />
                ))}
                {scans.length === 0 && <div className="h-14 w-14 rounded-md border border-dashed" />}
              </div>
              <div className="flex-1 grid gap-2 md:grid-cols-4 text-sm">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.id} · {p.age} y {p.sex}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Admitted</div>
                  <div>{fmtDate(p.admittedAt)}</div>
                  <div className="text-xs text-muted-foreground">{p.site.split(" – ")[1]}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">NIHSS / treatment</div>
                  <div>
                    {p.nihssAdmission} · {p.treatment ?? "—"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant="secondary">{p.status}</Badge>
                  {truth && <LabelBadge label={truth} />}
                  {scans.some((s) => s.status !== "validated") && <StatusBadge status={scans.find((s) => s.status !== "validated")!.status} />}
                </div>
              </div>
              <Button size="sm" onClick={() => setViewing(p)}>
                View full record
              </Button>
            </CardContent>
          </Card>
        ))}
        {rows.length > limit && (
          <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 15)}>
            Show more ({rows.length - limit} remaining)
          </Button>
        )}
        {rows.length === 0 && <p className="text-center text-muted-foreground py-10">No patients match.</p>}
      </div>

      <PatientDetailDialog patient={viewing} onOpenChange={(o) => !o && setViewing(null)} />
    </div>
  )
}

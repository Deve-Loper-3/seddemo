"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Database, Download, Eye, Pencil, Search, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/dashboard-shell"
import { StatCard } from "@/components/common"
import { PatientForm } from "@/components/patient-form"
import { PatientDetailDialog } from "@/components/patient-detail"
import { useDB, useStore } from "@/lib/store"
import { downloadFile, fmtDate, toCSV } from "@/lib/metrics"
import type { Patient } from "@/lib/types"

const PAGE = 12

export default function DatabaseManagementPage() {
  const db = useDB()
  const { can, updatePatient, deletePatient, log } = useStore()
  const [q, setQ] = useState("")
  const [site, setSite] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(0)
  const [viewing, setViewing] = useState<Patient | null>(null)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleting, setDeleting] = useState<Patient | null>(null)

  const canEdit = can("edit_patients")
  const canExport = can("export_data")

  const scanCount = useMemo(() => {
    const m = new Map<string, number>()
    db.scans.forEach((s) => m.set(s.patientId, (m.get(s.patientId) ?? 0) + 1))
    return m
  }, [db.scans])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return db.patients
      .filter((p) => site === "all" || p.site === site)
      .filter((p) => status === "all" || p.status === status)
      .filter((p) => !needle || [p.id, p.name, p.site, p.presentingSymptoms, fmtDate(p.admittedAt)].some((v) => v.toLowerCase().includes(needle)))
      .sort((a, b) => b.admittedAt.localeCompare(a.admittedAt))
  }, [db.patients, q, site, status])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE)
  const incomplete = db.patients.filter((p) => p.status !== "Admitted" && (!p.treatment || p.nihssDischarge === undefined)).length

  const exportCsv = () => {
    const csv = toCSV(
      filtered.map((p) => ({
        study_id: p.id,
        age: p.age,
        sex: p.sex,
        site: p.site,
        admitted: p.admittedAt.slice(0, 10),
        nihss_admission: p.nihssAdmission,
        onset_hours: p.symptomOnsetHours,
        comorbidities: p.comorbidities,
        status: p.status,
        treatment: p.treatment,
        nihss_discharge: p.nihssDischarge,
        mrs_90: p.mrs90,
        scans: scanCount.get(p.id) ?? 0,
      })),
    )
    downloadFile(`patients-deidentified-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv")
    log("export_data", `Exported ${filtered.length} de-identified patient records`, "warning")
    toast.success(`Exported ${filtered.length} records (names removed)`)
  }

  return (
    <div>
      <PageHeader
        title="Database Management"
        description="Search, update and export study records"
        icon={Database}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={!canExport} title={canExport ? "" : "Your role lacks the export permission"}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            {canEdit && (
              <Button asChild>
                <Link href="/dashboard/data-entry/data-entry-forms">
                  <UserPlus className="h-4 w-4 mr-2" /> New patient
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total records" value={db.patients.length} />
        <StatCard label="Currently admitted" value={db.patients.filter((p) => p.status === "Admitted").length} />
        <StatCard label="With MRI" value={db.patients.filter((p) => scanCount.has(p.id)).length} tone="green" />
        <StatCard label="Incomplete outcome data" value={incomplete} tone="orange" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient records</CardTitle>
          <CardDescription>
            {filtered.length} of {db.patients.length} records
          </CardDescription>
          <div className="flex flex-col gap-2 md:flex-row pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, site, symptom or date…"
                className="pl-10"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setPage(0)
                }}
              />
            </div>
            <Select
              value={site}
              onValueChange={(v) => {
                setSite(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="md:w-56">
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
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Admitted", "Discharged", "Follow-up", "Deceased"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age/Sex</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Admitted</TableHead>
                  <TableHead>NIHSS</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      {p.age} / {p.sex[0]}
                    </TableCell>
                    <TableCell className="text-xs">{p.site}</TableCell>
                    <TableCell className="text-xs">{fmtDate(p.admittedAt)}</TableCell>
                    <TableCell>{p.nihssAdmission}</TableCell>
                    <TableCell>{scanCount.get(p.id) ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "Admitted" ? "default" : "secondary"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(p)} aria-label="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)} disabled={!canEdit} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleting(p)} disabled={!canEdit} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No records match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4 text-sm">
            <span className="text-muted-foreground">
              Page {page + 1} of {pages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientDetailDialog patient={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editing?.id}</DialogTitle>
          </DialogHeader>
          {editing && (
            <PatientForm
              initial={editing}
              sites={db.sites}
              showOutcomes
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
              onSubmit={(input) => {
                updatePatient(editing.id, input)
                toast.success(`${editing.id} updated`)
                setEditing(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {deleting?.name} and all {scanCount.get(deleting?.id ?? "") ?? 0} associated scan(s), annotations and case discussions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!deleting) return
                deletePatient(deleting.id)
                toast.success(`${deleting.id} deleted`)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

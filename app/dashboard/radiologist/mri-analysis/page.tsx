"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Brain, MessagesSquare, RefreshCw, ScanLine, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/dashboard-shell"
import { EmptyState, LabelBadge, StatusBadge } from "@/components/common"
import { AnnotationWorkbench } from "@/components/annotation-workbench"
import { AIFindings, PatientSummary, ReviewDialog } from "@/components/review-panel"
import { NewCaseDialog } from "@/components/new-case-dialog"
import { useDB, useStore } from "@/lib/store"
import { fromNow, patientMap } from "@/lib/metrics"
import { cn } from "@/lib/utils"

function MRIAnalysisInner() {
  const db = useDB()
  const { rerunAI } = useStore()
  const params = useSearchParams()
  const patients = useMemo(() => patientMap(db), [db])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [seq, setSeq] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(params.get("scan"))
  const [reviewOpen, setReviewOpen] = useState(false)
  const [caseOpen, setCaseOpen] = useState(false)

  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return db.scans
      .filter((s) => status === "all" || s.status === status)
      .filter((s) => seq === "all" || s.sequence === seq)
      .filter((s) => !n || s.id.toLowerCase().includes(n) || s.patientId.toLowerCase().includes(n) || patients.get(s.patientId)?.name.toLowerCase().includes(n))
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  }, [db.scans, q, status, seq, patients])

  const selected = db.scans.find((s) => s.id === selectedId) ?? list[0]
  const patient = selected ? patients.get(selected.patientId) : undefined

  return (
    <div>
      <PageHeader title="MRI Analysis" description="Open studies in the viewer, adjust window/level and annotate lesions" icon={ScanLine} />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Worklist ({list.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Scan ID, patient ID or name" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="processing">AI processing</SelectItem>
                  <SelectItem value="pending-radiologist">Awaiting radiologist</SelectItem>
                  <SelectItem value="pending-validation">Awaiting validation</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={seq} onValueChange={setSeq}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sequences</SelectItem>
                  {["DWI", "ADC", "FLAIR", "T2", "T1", "MRA"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto p-2">
            <ul className="space-y-1">
              {list.map((s) => {
                const p = patients.get(s.patientId)
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors",
                        selected?.id === s.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt="" className="h-11 w-11 rounded object-cover bg-black" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {s.id} <span className="text-muted-foreground font-normal">· {s.sequence}</span>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {p?.name} · {fromNow(s.uploadedAt)}
                        </div>
                        <div className="mt-1">
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        {selected ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {selected.id} <StatusBadge status={selected.status} />
                      {selected.ai && <LabelBadge label={selected.ai.label} />}
                    </CardTitle>
                    <CardDescription>
                      {selected.fileName} · {selected.fileSizeMb} MB · uploaded by {selected.uploadedBy} {fromNow(selected.uploadedAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setReviewOpen(true)} disabled={!selected.ai}>
                      <Brain className="h-4 w-4 mr-1" /> {selected.radiologistReview ? "Amend review" : "Review AI result"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCaseOpen(true)}>
                      <MessagesSquare className="h-4 w-4 mr-1" /> Discuss case
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        rerunAI(selected.id)
                        toast.info(`${selected.id} re-queued for AI analysis`)
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Re-run AI
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AnnotationWorkbench key={selected.id} scan={selected} />
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Patient</CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientSummary patient={patient} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <AIFindings scan={selected} threshold={db.settings.aiConfidenceThreshold} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <EmptyState icon={ScanLine} title="No scans match the filters" />
        )}
      </div>

      {selected && (
        <>
          <ReviewDialog
            key={selected.id}
            scan={selected}
            patient={patient}
            stage="radiologist"
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            threshold={db.settings.aiConfidenceThreshold}
          />
          <NewCaseDialog scanId={selected.id} open={caseOpen} onOpenChange={setCaseOpen} />
        </>
      )}
    </div>
  )
}

export default function MRIAnalysisPage() {
  return (
    <Suspense fallback={null}>
      <MRIAnalysisInner />
    </Suspense>
  )
}

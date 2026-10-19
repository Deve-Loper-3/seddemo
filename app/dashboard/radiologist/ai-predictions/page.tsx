"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, CheckCircle, FileText, Inbox, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard-shell"
import { ConfidenceBar, EmptyState, LabelBadge, StatCard, StatusBadge, VerdictBadge } from "@/components/common"
import { ReviewDialog } from "@/components/review-panel"
import { ScanThumb } from "@/components/scan-viewer"
import { useDB, useStore } from "@/lib/store"
import { fromNow, patientMap } from "@/lib/metrics"
import type { Scan } from "@/lib/types"

type Sort = "priority" | "confidence" | "oldest"

export default function AIPredictionsPage() {
  const db = useDB()
  const { user, submitRadiologistReview, can } = useStore()
  const [tab, setTab] = useState<"queue" | "mine" | "all">("queue")
  const [sort, setSort] = useState<Sort>("priority")
  const [open, setOpen] = useState<Scan | null>(null)
  const patients = useMemo(() => patientMap(db), [db])
  const threshold = db.settings.aiConfidenceThreshold

  const list = useMemo(() => {
    let l = db.scans.filter((s) => s.ai)
    if (tab === "queue") l = l.filter((s) => s.status === "pending-radiologist")
    if (tab === "mine") l = l.filter((s) => s.radiologistReview?.reviewer === user?.name)
    const nihss = (s: Scan) => patients.get(s.patientId)?.nihssAdmission ?? 0
    return l.sort((a, b) =>
      sort === "confidence"
        ? a.ai!.confidence - b.ai!.confidence
        : sort === "oldest"
          ? a.uploadedAt.localeCompare(b.uploadedAt)
          : nihss(b) - nihss(a) || a.uploadedAt.localeCompare(b.uploadedAt),
    )
  }, [db.scans, tab, sort, user?.name, patients])

  const queue = db.scans.filter((s) => s.status === "pending-radiologist")
  const lowConf = queue.filter((s) => s.ai && s.ai.confidence < threshold).length

  const quickAccept = (s: Scan) => {
    submitRadiologistReview(s.id, { verdict: "correct", finalLabel: s.ai!.label, notes: "" })
    toast.success(`${s.id} accepted – sent for expert validation`)
  }

  return (
    <div>
      <PageHeader title="AI Predictions" description="Validate AI-generated stroke detections in your reading queue" icon={FileText} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="In reading queue" value={queue.length} icon={Inbox} tone="orange" />
        <StatCard label={`Below ${Math.round(threshold * 100)}% confidence`} value={lowConf} icon={AlertTriangle} tone="red" />
        <StatCard label="Reviewed by you" value={db.scans.filter((s) => s.radiologistReview?.reviewer === user?.name).length} icon={CheckCircle} tone="green" />
        <StatCard
          label="AI overruled (all reads)"
          value={db.scans.filter((s) => s.radiologistReview?.verdict === "incorrect").length}
          icon={XCircle}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="queue">Queue ({queue.length})</TabsTrigger>
            <TabsTrigger value="mine">My reviews</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort: clinical priority (NIHSS)</SelectItem>
            <SelectItem value="confidence">Sort: lowest confidence first</SelectItem>
            <SelectItem value="oldest">Sort: oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={CheckCircle} title={tab === "queue" ? "Queue is empty" : "Nothing here yet"}>
          {tab === "queue" ? "All AI predictions have been read. New uploads will appear here once the AI finishes." : null}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.slice(0, 60).map((s) => {
            const p = patients.get(s.patientId)
            return (
              <Card key={s.id} className="overflow-hidden flex flex-col">
                <button className="relative block" onClick={() => setOpen(s)}>
                  <ScanThumb scan={s} />
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">{s.sequence}</span>
                </button>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{s.id}</CardTitle>
                      <CardDescription>
                        {p?.name} · {p?.age} y · NIHSS {p?.nihssAdmission}
                      </CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{fromNow(s.uploadedAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <LabelBadge label={s.ai!.label} />
                    {s.status !== "pending-radiologist" && <StatusBadge status={s.status} />}
                    {s.radiologistReview && <VerdictBadge verdict={s.radiologistReview.verdict} />}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {s.ai!.region}
                    {s.ai!.volumeMl ? ` · ${s.ai!.volumeMl} mL` : ""}
                  </div>
                  <ConfidenceBar value={s.ai!.confidence} threshold={threshold} />
                  <div className="mt-auto flex gap-2 pt-2">
                    {s.status === "pending-radiologist" ? (
                      <>
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => quickAccept(s)} disabled={!can("review_ai")}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => setOpen(s)}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject…
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setOpen(s)}>
                          Open
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(s)}>
                        View / amend review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ReviewDialog
        key={open?.id}
        scan={open ? (db.scans.find((x) => x.id === open.id) ?? null) : null}
        patient={open ? patients.get(open.patientId) : undefined}
        stage="radiologist"
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        threshold={threshold}
      />
    </div>
  )
}

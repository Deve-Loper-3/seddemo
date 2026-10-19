"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, CheckCircle, ClipboardCheck, HelpCircle, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard-shell"
import { ConfidenceBar, EmptyState, LabelBadge, StatCard, VerdictBadge } from "@/components/common"
import { ReviewDialog } from "@/components/review-panel"
import { ScanThumb } from "@/components/scan-viewer"
import { useDB, useStore } from "@/lib/store"
import { fromNow, patientMap } from "@/lib/metrics"

export default function AIPredictionsReviewPage() {
  const db = useDB()
  const { user } = useStore()
  const patients = useMemo(() => patientMap(db), [db])
  const [tab, setTab] = useState<"pending" | "mine" | "validated">("pending")
  const [disagreementsOnly, setDisagreementsOnly] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const threshold = db.settings.aiConfidenceThreshold

  const pending = db.scans.filter((s) => s.status === "pending-validation")
  const list = useMemo(() => {
    let l =
      tab === "pending"
        ? pending
        : tab === "mine"
          ? db.scans.filter((s) => s.expertValidation?.reviewer === user?.name)
          : db.scans.filter((s) => s.status === "validated")
    if (disagreementsOnly) l = l.filter((s) => s.radiologistReview && s.radiologistReview.verdict !== "correct")
    // disagreements and low-confidence first
    return [...l].sort(
      (a, b) =>
        Number(b.radiologistReview?.verdict !== "correct") - Number(a.radiologistReview?.verdict !== "correct") ||
        (a.ai?.confidence ?? 1) - (b.ai?.confidence ?? 1),
    )
  }, [tab, pending, db.scans, user?.name, disagreementsOnly])

  const open = db.scans.find((s) => s.id === openId) ?? null

  return (
    <div>
      <PageHeader
        title="AI Predictions Review"
        description="Final expert validation of AI classifications that radiologists have already read"
        icon={ClipboardCheck}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Awaiting validation" value={pending.length} icon={Inbox} tone="orange" />
        <StatCard
          label="Radiologist disagreed with AI"
          value={pending.filter((s) => s.radiologistReview?.verdict === "incorrect").length}
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard label="Marked uncertain" value={pending.filter((s) => s.radiologistReview?.verdict === "uncertain").length} icon={HelpCircle} />
        <StatCard label="Validated by you" value={db.scans.filter((s) => s.expertValidation?.reviewer === user?.name).length} icon={CheckCircle} tone="green" />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">Awaiting ({pending.length})</TabsTrigger>
            <TabsTrigger value="mine">My validations</TabsTrigger>
            <TabsTrigger value="validated">All validated</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Switch id="dis" checked={disagreementsOnly} onCheckedChange={setDisagreementsOnly} />
          <Label htmlFor="dis">Only cases where the radiologist disagreed / was unsure</Label>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={CheckCircle} title="Nothing to validate">
          When a radiologist reviews an AI result, it will appear here for final validation.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {list.slice(0, 80).map((s) => {
            const p = patients.get(s.patientId)
            return (
              <Card key={s.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-4 p-0 md:flex-row md:items-center">
                  <button onClick={() => setOpenId(s.id)} className="md:w-40 shrink-0">
                    <ScanThumb scan={s} className="h-36" />
                  </button>
                  <div className="grid flex-1 gap-3 p-4 md:grid-cols-4 md:p-0 md:pr-4">
                    <div>
                      <div className="font-semibold">{p?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.id} · {s.sequence} · {p?.age} y {p?.sex}
                      </div>
                      <div className="text-xs text-muted-foreground">{p?.site}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">AI prediction</div>
                      <LabelBadge label={s.ai!.label} />
                      <ConfidenceBar value={s.ai!.confidence} threshold={threshold} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Radiologist</div>
                      {s.radiologistReview ? (
                        <>
                          <VerdictBadge verdict={s.radiologistReview.verdict} />
                          <div className="text-xs text-muted-foreground">
                            {s.radiologistReview.reviewer} · {fromNow(s.radiologistReview.at)}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {s.expertValidation && <VerdictBadge verdict={s.expertValidation.verdict} />}
                      <Button size="sm" onClick={() => setOpenId(s.id)} variant={s.expertValidation ? "outline" : "default"}>
                        {s.expertValidation ? "View / amend" : "Validate"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ReviewDialog
        key={openId ?? "none"}
        scan={open}
        patient={open ? patients.get(open.patientId) : undefined}
        stage="expert"
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        threshold={threshold}
      />
    </div>
  )
}

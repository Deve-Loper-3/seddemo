"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScanViewer } from "@/components/scan-viewer"
import { ConfidenceBar, LabelBadge, StatusBadge, VerdictBadge } from "@/components/common"
import { useStore } from "@/lib/store"
import { fmtDateTime } from "@/lib/metrics"
import type { Patient, Review, Scan, StrokeLabel, Verdict } from "@/lib/types"

export function AIFindings({ scan, threshold }: { scan: Scan; threshold?: number }) {
  if (!scan.ai) return <p className="text-sm text-muted-foreground">AI analysis has not completed yet.</p>
  const ai = scan.ai
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      <div className="col-span-2">
        <dt className="text-muted-foreground mb-1">AI classification</dt>
        <dd className="flex flex-wrap items-center gap-2">
          <LabelBadge label={ai.label} />
          {ai.subtype && <span className="text-muted-foreground">{ai.subtype}</span>}
        </dd>
      </div>
      <div className="col-span-2">
        <dt className="text-muted-foreground mb-1">Confidence</dt>
        <dd>
          <ConfidenceBar value={ai.confidence} threshold={threshold} />
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Region</dt>
        <dd className="font-medium">{ai.region}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Lesion volume</dt>
        <dd className="font-medium">{ai.volumeMl ? `${ai.volumeMl} mL` : "—"}</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-muted-foreground">Model</dt>
        <dd className="font-medium">{ai.modelVersion}</dd>
      </div>
    </dl>
  )
}

export function PatientSummary({ patient }: { patient?: Patient }) {
  if (!patient) return null
  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
      <div className="font-medium">
        {patient.name} · {patient.age} y · {patient.sex}
      </div>
      <div className="text-muted-foreground">
        {patient.id} · {patient.site}
      </div>
      <div>
        NIHSS {patient.nihssAdmission} · onset {patient.symptomOnsetHours} h before scan
      </div>
      <div className="text-muted-foreground">{patient.presentingSymptoms}</div>
      {patient.comorbidities.length > 0 && <div className="text-muted-foreground">Risk factors: {patient.comorbidities.join(", ")}</div>}
    </div>
  )
}

export function PriorReview({ title, review }: { title: string; review?: Review }) {
  if (!review) return null
  return (
    <div className="rounded-lg border p-3 text-sm space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{title}</span>
        <VerdictBadge verdict={review.verdict} />
      </div>
      <div>
        Final read: <LabelBadge label={review.finalLabel} />
      </div>
      {review.notes && <p className="text-muted-foreground">“{review.notes}”</p>}
      <div className="text-xs text-muted-foreground">
        {review.reviewer} · {fmtDateTime(review.at)}
      </div>
    </div>
  )
}

/** Verdict form. stage decides which store action is used. */
export function ReviewForm({ scan, stage, onDone }: { scan: Scan; stage: "radiologist" | "expert"; onDone?: () => void }) {
  const { submitRadiologistReview, submitExpertValidation, can } = useStore()
  const allowed = can(stage === "radiologist" ? "review_ai" : "validate_cases")
  const existing = stage === "radiologist" ? scan.radiologistReview : scan.expertValidation
  const [verdict, setVerdict] = useState<Verdict>(existing?.verdict ?? "correct")
  const [finalLabel, setFinalLabel] = useState<StrokeLabel>(existing?.finalLabel ?? scan.ai?.label ?? "Ischemic stroke")
  const [notes, setNotes] = useState(existing?.notes ?? "")

  const setVerdictAndLabel = (v: Verdict) => {
    setVerdict(v)
    if (!scan.ai) return
    if (v === "correct") setFinalLabel(scan.ai.label)
    if (v === "incorrect") setFinalLabel(scan.ai.label === "Ischemic stroke" ? "No acute stroke" : "Ischemic stroke")
  }

  const submit = () => {
    if (verdict !== "correct" && !notes.trim()) {
      toast.error("Please add a short note explaining your decision.")
      return
    }
    const payload = { verdict, finalLabel, notes: notes.trim() }
    if (stage === "radiologist") submitRadiologistReview(scan.id, payload)
    else submitExpertValidation(scan.id, payload)
    toast.success(stage === "radiologist" ? `Review saved – ${scan.id} sent for expert validation` : `${scan.id} validated`)
    onDone?.()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Is the AI prediction correct?</Label>
        <RadioGroup value={verdict} onValueChange={(v) => setVerdictAndLabel(v as Verdict)} className="grid grid-cols-3 gap-2">
          {(
            [
              ["correct", "Correct", "border-emerald-300 data-[on=true]:bg-emerald-50"],
              ["incorrect", "Incorrect", "border-red-300 data-[on=true]:bg-red-50"],
              ["uncertain", "Uncertain", "border-amber-300 data-[on=true]:bg-amber-50"],
            ] as const
          ).map(([v, label, cls]) => (
            <Label key={v} data-on={verdict === v} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm ${cls}`}>
              <RadioGroupItem value={v} /> {label}
            </Label>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label>Final diagnosis</Label>
        <RadioGroup value={finalLabel} onValueChange={(v) => setFinalLabel(v as StrokeLabel)} className="flex gap-4">
          {(["Ischemic stroke", "No acute stroke"] as StrokeLabel[]).map((l) => (
            <Label key={l} className="flex items-center gap-2 text-sm font-normal cursor-pointer">
              <RadioGroupItem value={l} /> {l}
            </Label>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`notes-${scan.id}`}>Notes {verdict !== "correct" && <span className="text-red-600">*</span>}</Label>
        <Textarea id={`notes-${scan.id}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Findings, reasons for disagreement, artefacts…" />
      </div>
      {!allowed && (
        <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-800">
          Your role no longer has the “{stage === "radiologist" ? "Review AI predictions" : "Final expert validation"}” permission.
        </p>
      )}
      <Button className="w-full" onClick={submit} disabled={!scan.ai || !allowed}>
        {existing ? "Update" : "Submit"} {stage === "radiologist" ? "review" : "validation"}
      </Button>
    </div>
  )
}

export function ReviewDialog({
  scan,
  patient,
  stage,
  open,
  onOpenChange,
  threshold,
}: {
  scan: Scan | null
  patient?: Patient
  stage: "radiologist" | "expert"
  open: boolean
  onOpenChange: (o: boolean) => void
  threshold?: number
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
        {scan && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {scan.id} <StatusBadge status={scan.status} />
              </DialogTitle>
              <DialogDescription>
                {scan.sequence} · uploaded {fmtDateTime(scan.uploadedAt)} by {scan.uploadedBy}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
              <ScanViewer scan={scan} />
              <div className="space-y-4">
                <PatientSummary patient={patient} />
                <AIFindings scan={scan} threshold={threshold} />
                {stage === "expert" && <PriorReview title="Radiologist review" review={scan.radiologistReview} />}
                <ReviewForm scan={scan} stage={stage} onDone={() => onOpenChange(false)} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScanViewer } from "@/components/scan-viewer"
import { LabelBadge, StatusBadge } from "@/components/common"
import { PriorReview } from "@/components/review-panel"
import { useDB } from "@/lib/store"
import { fmtDate, fmtDateTime } from "@/lib/metrics"
import type { Patient } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PatientDetailDialog({ patient, onOpenChange }: { patient: Patient | null; onOpenChange: (o: boolean) => void }) {
  const db = useDB()
  const scans = patient ? db.scans.filter((s) => s.patientId === patient.id) : []
  const [scanId, setScanId] = useState<string | null>(null)
  const active = scans.find((s) => s.id === scanId) ?? scans[0]

  return (
    <Dialog
      open={!!patient}
      onOpenChange={(o) => {
        if (!o) setScanId(null)
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
        {patient && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {patient.name} <Badge variant="outline">{patient.id}</Badge> <Badge variant="secondary">{patient.status}</Badge>
              </DialogTitle>
              <DialogDescription>
                {patient.age} y · {patient.sex} · {patient.site} · admitted {fmtDateTime(patient.admittedAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4 text-sm">
                <section>
                  <h3 className="font-semibold mb-2">Presentation</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-muted-foreground">NIHSS (admission)</dt>
                    <dd className="font-medium">{patient.nihssAdmission}</dd>
                    <dt className="text-muted-foreground">Onset → scan</dt>
                    <dd className="font-medium">{patient.symptomOnsetHours} h</dd>
                    <dt className="text-muted-foreground">Symptoms</dt>
                    <dd>{patient.presentingSymptoms}</dd>
                    <dt className="text-muted-foreground">Risk factors</dt>
                    <dd>{patient.comorbidities.join(", ") || "None recorded"}</dd>
                  </dl>
                </section>
                <section>
                  <h3 className="font-semibold mb-2">Treatment & outcome</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-muted-foreground">Treatment</dt>
                    <dd>{patient.treatment ?? "—"}</dd>
                    <dt className="text-muted-foreground">NIHSS (discharge)</dt>
                    <dd>{patient.nihssDischarge ?? "—"}</dd>
                    <dt className="text-muted-foreground">90-day mRS</dt>
                    <dd>{patient.mrs90 ?? "—"}</dd>
                    <dt className="text-muted-foreground">Length of stay</dt>
                    <dd>{patient.lengthOfStayDays ? `${patient.lengthOfStayDays} days` : "—"}</dd>
                  </dl>
                </section>
                {patient.notes && (
                  <section>
                    <h3 className="font-semibold mb-1">Notes</h3>
                    <p className="text-muted-foreground">{patient.notes}</p>
                  </section>
                )}
                <p className="text-xs text-muted-foreground">
                  Entered by {patient.createdBy} on {fmtDate(patient.createdAt)} · last updated {fmtDateTime(patient.updatedAt)}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Imaging ({scans.length})</h3>
                {scans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No MRI uploaded yet.</p>
                ) : (
                  <>
                    <div className="flex gap-2 overflow-x-auto">
                      {scans.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setScanId(s.id)}
                          className={cn("shrink-0 rounded border-2 overflow-hidden", active?.id === s.id ? "border-primary" : "border-transparent")}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.image} alt={s.id} className="h-14 w-14 object-cover bg-black" />
                        </button>
                      ))}
                    </div>
                    {active && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">{active.id}</span>
                          <StatusBadge status={active.status} />
                          {active.ai && <LabelBadge label={active.ai.label} />}
                          {active.ai && <span className="text-muted-foreground">{Math.round(active.ai.confidence * 100)}% conf.</span>}
                        </div>
                        <ScanViewer key={active.id} scan={active} controls={false} />
                        <PriorReview title="Radiologist review" review={active.radiologistReview} />
                        <PriorReview title="Expert validation" review={active.expertValidation} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Edit3, Layers, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/dashboard-shell"
import { LabelBadge, StatCard, StatusBadge } from "@/components/common"
import { AnnotationWorkbench } from "@/components/annotation-workbench"
import { useDB } from "@/lib/store"
import { patientMap } from "@/lib/metrics"
import { cn } from "@/lib/utils"

export default function AnnotateCorrectPage() {
  const db = useDB()
  const patients = useMemo(() => patientMap(db), [db])
  const [ischemicOnly, setIschemicOnly] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const scans = db.scans
    .filter((s) => s.ai && (!ischemicOnly || s.ai.label === "Ischemic stroke"))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  const selected = db.scans.find((s) => s.id === selectedId) ?? scans[0]
  const retrain = db.annotations.filter((a) => a.forRetraining)

  return (
    <div>
      <PageHeader
        title="Annotate and Correct"
        description="Correct AI lesion segmentations and submit them to the retraining dataset"
        icon={Edit3}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Annotations saved" value={db.annotations.length} icon={Edit3} />
        <StatCard label="Queued for retraining" value={retrain.length} icon={RefreshCcw} tone="green" />
        <StatCard label="Scans with annotations" value={new Set(db.annotations.map((a) => a.scanId)).size} icon={Layers} />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Choose a scan</CardTitle>
            <div className="flex items-center gap-2">
              <Switch id="isch" checked={ischemicOnly} onCheckedChange={setIschemicOnly} />
              <Label htmlFor="isch" className="text-sm">
                Only AI-positive scans
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {scans.slice(0, 40).map((s) => {
              const n = db.annotations.filter((a) => a.scanId === s.id).length
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn("relative w-24 shrink-0 overflow-hidden rounded-md border-2 text-left", selected?.id === s.id ? "border-primary" : "border-transparent")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.id} className="h-24 w-24 object-cover bg-black" />
                  <div className="bg-card px-1 py-0.5 text-[10px] font-mono">{s.id}</div>
                  {n > 0 && <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{n}</span>}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {selected.id} <StatusBadge status={selected.status} /> {selected.ai && <LabelBadge label={selected.ai.label} />}
            </CardTitle>
            <CardDescription>
              {patients.get(selected.patientId)?.name} · {selected.sequence} · AI region: {selected.ai?.region}. Draw on the image to outline the true lesion boundary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnnotationWorkbench key={selected.id} scan={selected} showOverlayPicker defaultRetraining />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

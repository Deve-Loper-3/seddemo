"use client"

import { useMemo, useState } from "react"
import { Brain, Download } from "lucide-react"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { ConfusionMatrix, MetricTiles } from "@/components/charts"
import { useDB, useStore } from "@/lib/store"
import { adjudicated, confusion, downloadFile, pct, roc, scores, toCSV } from "@/lib/metrics"
import { MODELS } from "@/lib/types"

export default function AIPerformancePage() {
  const db = useDB()
  const { can, log } = useStore()
  const [threshold, setThreshold] = useState(0.5)
  const adj = useMemo(() => adjudicated(db.scans), [db.scans])

  // ensemble probability = mean of the three backbones
  const ensembleProb = (id: string) => {
    const s = adj.find((x) => x.id === id)!
    return MODELS.reduce((a, m) => a + s.ai!.modelProbs[m], 0) / MODELS.length
  }
  const cThresh = confusion(adj, (s) => ensembleProb(s.id) >= threshold)
  const cDefault = confusion(adj)
  const sDefault = scores(cDefault)

  const versions = [...new Set(adj.map((s) => s.ai!.modelVersion))].sort()
  const byVersion = versions.map((v) => {
    const l = adj.filter((s) => s.ai!.modelVersion === v)
    const s = scores(confusion(l))
    return { version: v.replace("StrokeNet ", ""), Accuracy: +(s.accuracy * 100).toFixed(1), Sensitivity: +(s.sensitivity * 100).toFixed(1), Specificity: +(s.specificity * 100).toFixed(1), n: l.length }
  })

  const aucs = MODELS.map((m) => ({ m, auc: roc(adj, m).auc }))

  const exportMetrics = () => {
    if (!can("export_data")) return toast.error("Your role lacks the export permission")
    const rows = adj.map((s) => ({
      scan_id: s.id,
      sequence: s.sequence,
      model_version: s.ai!.modelVersion,
      ai_label: s.ai!.label,
      ai_confidence: s.ai!.confidence,
      resnet50: s.ai!.modelProbs.ResNet50,
      efficientnet_b4: s.ai!.modelProbs["EfficientNet-B4"],
      densenet121: s.ai!.modelProbs.DenseNet121,
      truth: s.expertValidation?.finalLabel ?? s.radiologistReview?.finalLabel,
    }))
    downloadFile("ai-predictions-vs-truth.csv", toCSV(rows), "text/csv")
    log("export_data", `Exported ${rows.length} AI predictions with ground truth`, "warning")
    toast.success("Prediction-level data exported")
  }

  return (
    <div>
      <PageHeader
        title="AI Performance"
        description="Model accuracy against adjudicated ground truth"
        icon={Brain}
        actions={
          <Button variant="outline" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" /> Export predictions CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Adjudicated scans" value={adj.length} />
        <StatCard label="Accuracy" value={pct(sDefault.accuracy)} tone="green" />
        <StatCard label="Sensitivity" value={pct(sDefault.sensitivity)} />
        <StatCard label="Best single-model AUC" value={Math.max(...aucs.map((a) => a.auc)).toFixed(3)} hint={aucs.sort((a, b) => b.auc - a.auc)[0]?.m} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Production model</CardTitle>
            <CardDescription>Deployed classifications (as shown to clinicians)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ConfusionMatrix c={cDefault} />
            <MetricTiles c={cDefault} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Threshold explorer</CardTitle>
            <CardDescription>How the ensemble behaves if the decision threshold is moved</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Decision threshold</span>
                <span className="font-mono font-semibold">{threshold.toFixed(2)}</span>
              </div>
              <Slider value={[threshold]} min={0.05} max={0.95} step={0.05} onValueChange={([v]) => setThreshold(v)} />
              <p className="mt-2 text-xs text-muted-foreground">Lower thresholds catch more strokes (sensitivity) at the cost of more false alarms.</p>
            </div>
            <ConfusionMatrix c={cThresh} />
            <MetricTiles c={cThresh} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by model version</CardTitle>
          <CardDescription>Adjudicated scans grouped by the model version that produced the prediction</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byVersion}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="version" fontSize={11} tickFormatter={(v) => `${v} (n=${byVersion.find((b) => b.version === v)?.n})`} />
              <YAxis domain={[0, 100]} unit="%" fontSize={11} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Bar dataKey="Accuracy" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Sensitivity" fill={CHART_COLORS[1]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Specificity" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

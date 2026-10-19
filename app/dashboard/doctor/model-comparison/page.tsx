"use client"

import { useMemo, useState } from "react"
import { GitCompare } from "lucide-react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, LabelBadge } from "@/components/common"
import { ScanViewer } from "@/components/scan-viewer"
import { useDB } from "@/lib/store"
import { adjudicated, groundTruth, modelScores, patientMap, pct, roc } from "@/lib/metrics"
import { MODELS } from "@/lib/types"

export default function ModelComparisonPage() {
  const db = useDB()
  const patients = useMemo(() => patientMap(db), [db])
  const withAI = db.scans.filter((s) => s.ai).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  const [scanId, setScanId] = useState(withAI[0]?.id ?? "")
  const scan = db.scans.find((s) => s.id === scanId)
  const adj = useMemo(() => adjudicated(db.scans), [db.scans])

  const rocs = useMemo(() => MODELS.map((m) => ({ model: m, ...roc(adj, m) })), [adj])
  const rocData = rocs[0].pts.map((_, i) => {
    const row: Record<string, number> = { fpr: rocs[0].pts[i].fpr }
    rocs.forEach((r) => (row[r.model] = r.pts[i].tpr))
    return row
  })

  const agreement = adj.length
    ? adj.filter((s) => {
        const votes = MODELS.map((m) => s.ai!.modelProbs[m] >= 0.5)
        return votes.every((v) => v === votes[0])
      }).length / adj.length
    : 0

  const truth = scan ? groundTruth(scan) : undefined
  const votes = scan?.ai ? MODELS.map((m) => scan.ai!.modelProbs[m] >= 0.5) : []

  return (
    <div>
      <PageHeader title="Model Comparison" description="Compare the three classification backbones and two segmentation networks" icon={GitCompare} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Per-scan comparison</CardTitle>
              <CardDescription>Probability of ischemic stroke from each model on the same study</CardDescription>
            </div>
            <Select value={scanId} onValueChange={setScanId}>
              <SelectTrigger className="md:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {withAI.slice(0, 80).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.id} · {s.sequence} · {patients.get(s.patientId)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {scan?.ai && (
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <ScanViewer key={scan.id} scan={scan} controls={false} />
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  Reference standard: {truth ? <LabelBadge label={truth} /> : <span className="text-muted-foreground">not yet adjudicated</span>}
                  <span className="ml-auto text-muted-foreground">
                    {votes.every((v) => v === votes[0]) ? "All models agree" : "Models disagree"}
                  </span>
                </div>
                {MODELS.map((m, i) => {
                  const p = scan.ai!.modelProbs[m]
                  const pos = p >= 0.5
                  const correct = truth ? pos === (truth === "Ischemic stroke") : undefined
                  return (
                    <div key={m}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{m}</span>
                        <span className="tabular-nums">
                          {(p * 100).toFixed(1)}% → {pos ? "Ischemic" : "No stroke"}{" "}
                          {correct !== undefined && <span className={correct ? "text-emerald-600" : "text-red-600"}>{correct ? "✓" : "✗"}</span>}
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${p * 100}%`, background: CHART_COLORS[i] }} />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/40" title="0.5 decision threshold" />
                      </div>
                    </div>
                  )
                })}
                <div>
                  <div className="text-sm font-medium mb-2">Segmentation overlap (Dice)</div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["U-Net", "nnU-Net"] as const).map((n) => (
                      <div key={n} className="rounded-lg border p-3">
                        <div className="text-xl font-bold tabular-nums">{scan.ai!.segmentationDice[n].toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {scan.ai.lesion && (
              <div className="grid gap-4 md:grid-cols-2">
                {(["U-Net", "nnU-Net"] as const).map((n) => (
                  <div key={n}>
                    <div className="text-sm font-medium mb-2">{n} mask</div>
                    <ScanViewer scan={scan} controls={false} overlay={n} defaultHeatmap={false} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aggregate performance</CardTitle>
            <CardDescription>
              {adj.length} adjudicated scans · all three models agree on {pct(agreement)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Sens.</TableHead>
                  <TableHead>Spec.</TableHead>
                  <TableHead>AUC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODELS.map((m, i) => {
                  const s = modelScores(adj, m)
                  return (
                    <TableRow key={m}>
                      <TableCell className="font-medium">
                        <span className="inline-block h-2.5 w-2.5 rounded-full mr-2" style={{ background: CHART_COLORS[i] }} />
                        {m}
                      </TableCell>
                      <TableCell>{pct(s.accuracy)}</TableCell>
                      <TableCell>{pct(s.sensitivity)}</TableCell>
                      <TableCell>{pct(s.specificity)}</TableCell>
                      <TableCell>{rocs[i].auc.toFixed(3)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {(["U-Net", "nnU-Net"] as const).map((n) => {
                const pos = adj.filter((s) => s.ai!.segmentationDice[n] > 0)
                const mean = pos.reduce((a, s) => a + s.ai!.segmentationDice[n], 0) / (pos.length || 1)
                return (
                  <div key={n} className="rounded-lg border p-3">
                    <div className="text-lg font-bold">{mean.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">Mean Dice – {n}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ROC curves</CardTitle>
            <CardDescription>True-positive vs. false-positive rate across thresholds</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} fontSize={11} label={{ value: "False-positive rate", position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis domain={[0, 1]} fontSize={11} />
                <Tooltip formatter={(v: number) => v.toFixed(3)} labelFormatter={(v) => `FPR ${v}`} />
                <Legend verticalAlign="top" />
                {MODELS.map((m, i) => (
                  <Line key={m} type="stepAfter" dataKey={m} stroke={CHART_COLORS[i]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

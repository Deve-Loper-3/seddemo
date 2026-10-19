"use client"

import { useMemo, useState } from "react"
import { LineChart as LineIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, LabelBadge, StatCard } from "@/components/common"
import { ConfusionMatrix, GroupMetricChart } from "@/components/charts"
import { useDB } from "@/lib/store"
import { adjudicated, AGE_BANDS, ageBand, confusion, fmtDate, groundTruth, patientMap, pct, scores } from "@/lib/metrics"
import type { Scan } from "@/lib/types"

type Metric = "accuracy" | "sensitivity" | "specificity"

export default function PerformanceInsightsPage() {
  const db = useDB()
  const patients = useMemo(() => patientMap(db), [db])
  const [metric, setMetric] = useState<Metric>("accuracy")
  const [errorType, setErrorType] = useState<"all" | "fp" | "fn">("all")
  const adj = useMemo(() => adjudicated(db.scans), [db.scans])
  const c = confusion(adj)
  const s = scores(c)

  const by = (keyFn: (s: Scan) => string, keys: string[]) =>
    keys
      .map((k) => {
        const l = adj.filter((x) => keyFn(x) === k)
        return { name: k, value: scores(confusion(l))[metric], n: l.length }
      })
      .filter((d) => d.n > 0)

  const pat = (x: Scan) => patients.get(x.patientId)
  const bySite = by((x) => pat(x)?.site.split(" – ")[1] ?? "?", db.sites.map((x) => x.split(" – ")[1]))
  const byAge = by((x) => ageBand(pat(x)?.age ?? 0), AGE_BANDS)
  const bySex = by((x) => pat(x)?.sex ?? "?", ["Male", "Female"])
  const bySeq = by((x) => x.sequence, ["DWI", "ADC", "MRA", "T2", "T1", "FLAIR"])

  const errors = adj
    .filter((x) => {
      const truth = groundTruth(x) === "Ischemic stroke"
      const pred = x.ai!.label === "Ischemic stroke"
      if (errorType === "fp") return pred && !truth
      if (errorType === "fn") return !pred && truth
      return pred !== truth
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))

  return (
    <div>
      <PageHeader
        title="Performance Insights"
        description="Aggregated model performance against adjudicated ground truth"
        icon={LineIcon}
        actions={
          <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accuracy">Metric: accuracy</SelectItem>
              <SelectItem value="sensitivity">Metric: sensitivity</SelectItem>
              <SelectItem value="specificity">Metric: specificity</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Adjudicated scans" value={adj.length} />
        <StatCard label="Accuracy" value={pct(s.accuracy)} />
        <StatCard label="Sensitivity" value={pct(s.sensitivity)} tone="green" />
        <StatCard label="Specificity" value={pct(s.specificity)} tone="green" />
        <StatCard label="False negatives" value={c.fn} tone="red" hint="Missed strokes – most clinically important" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>By study site</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupMetricChart data={bySite} height={300} />
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>By age group</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupMetricChart data={byAge} height={170} color={CHART_COLORS[4]} />
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By sex</CardTitle>
              </CardHeader>
              <CardContent>
                <GroupMetricChart data={bySex} height={100} color={CHART_COLORS[5]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <GroupMetricChart data={bySeq} height={160} color={CHART_COLORS[3]} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Error distribution</CardTitle>
            <CardDescription>AI vs. adjudicated label</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfusionMatrix c={c} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Misclassified cases ({errors.length})</CardTitle>
                <CardDescription>Use these for error analysis and retraining</CardDescription>
              </div>
              <Select value={errorType} onValueChange={(v) => setErrorType(v as typeof errorType)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All errors</SelectItem>
                  <SelectItem value="fp">False positives</SelectItem>
                  <SelectItem value="fn">False negatives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Truth</TableHead>
                  <TableHead>Conf.</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.slice(0, 15).map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="font-mono text-xs">
                      {x.id} <span className="text-muted-foreground">{x.sequence}</span>
                    </TableCell>
                    <TableCell className="text-xs">{pat(x)?.site.split(" – ")[1]}</TableCell>
                    <TableCell>
                      <LabelBadge label={x.ai!.label} />
                    </TableCell>
                    <TableCell>
                      <LabelBadge label={groundTruth(x)!} />
                    </TableCell>
                    <TableCell>{Math.round(x.ai!.confidence * 100)}%</TableCell>
                    <TableCell className="text-xs">{fmtDate(x.uploadedAt)}</TableCell>
                  </TableRow>
                ))}
                {errors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No errors of this type.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

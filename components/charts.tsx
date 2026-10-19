"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Confusion } from "@/lib/metrics"
import { pct, scores } from "@/lib/metrics"
import { CHART_COLORS } from "@/components/common"

export function ConfusionMatrix({ c, positive = "Ischemic", negative = "No stroke" }: { c: Confusion; positive?: string; negative?: string }) {
  const cell = (v: number, good: boolean, label: string) => (
    <div className={`rounded-md p-4 text-center ${good ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
      <div className="text-2xl font-bold tabular-nums">{v}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
      <div />
      <div className="text-center text-xs text-muted-foreground">Truth: {positive}</div>
      <div className="text-center text-xs text-muted-foreground">Truth: {negative}</div>
      <div className="flex items-center text-xs text-muted-foreground [writing-mode:vertical-rl] rotate-180 justify-center">AI: {positive}</div>
      {cell(c.tp, true, "True positive")}
      {cell(c.fp, false, "False positive")}
      <div className="flex items-center text-xs text-muted-foreground [writing-mode:vertical-rl] rotate-180 justify-center">AI: {negative}</div>
      {cell(c.fn, false, "False negative")}
      {cell(c.tn, true, "True negative")}
    </div>
  )
}

export function MetricTiles({ c }: { c: Confusion }) {
  const s = scores(c)
  const items = [
    ["Accuracy", s.accuracy],
    ["Sensitivity", s.sensitivity],
    ["Specificity", s.specificity],
    ["Precision (PPV)", s.precision],
    ["NPV", s.npv],
    ["F1 score", s.f1],
  ] as const
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-lg border p-3">
          <div className="text-xl font-bold text-primary tabular-nums">{k === "F1 score" ? v.toFixed(3) : pct(v)}</div>
          <div className="text-xs text-muted-foreground">{k}</div>
        </div>
      ))}
    </div>
  )
}

/** Horizontal bars of a 0..1 metric per group, with n shown in the tooltip. */
export function GroupMetricChart({ data, height = 260, color = CHART_COLORS[0] }: { data: { name: string; value: number; n: number }[]; height?: number; color?: string }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} fontSize={11} />
          <YAxis type="category" dataKey="name" width={90} fontSize={11} />
          <Tooltip formatter={(v: number, _n, item) => [`${(v * 100).toFixed(1)}% (n=${item.payload.n})`, "Value"]} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.n < 3 ? "#cbd5e1" : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

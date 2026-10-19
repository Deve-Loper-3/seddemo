"use client"

import { AlertTriangle, CheckCircle2, Clock, HelpCircle, Loader2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ScanStatus, StrokeLabel, Verdict } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: "primary" | "green" | "orange" | "red"
}) {
  const toneCls = { primary: "text-primary", green: "text-emerald-600", orange: "text-orange-600", red: "text-red-600" }[tone]
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className={cn("text-2xl font-bold", toneCls)}>{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          {Icon && <Icon className={cn("h-7 w-7 opacity-80", toneCls)} />}
        </div>
      </CardContent>
    </Card>
  )
}

const STATUS_META: Record<ScanStatus, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  processing: { label: "AI processing", cls: "bg-sky-100 text-sky-800 border-sky-200", icon: Loader2 },
  "pending-radiologist": { label: "Awaiting radiologist", cls: "bg-orange-100 text-orange-800 border-orange-200", icon: Clock },
  "pending-validation": { label: "Awaiting expert validation", cls: "bg-violet-100 text-violet-800 border-violet-200", icon: Clock },
  validated: { label: "Validated", cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
}

export function StatusBadge({ status }: { status: ScanStatus }) {
  const m = STATUS_META[status]
  const Icon = m.icon
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", m.cls)}>
      <Icon className={cn("h-3 w-3", status === "processing" && "animate-spin")} />
      {m.label}
    </Badge>
  )
}

export function LabelBadge({ label }: { label: StrokeLabel }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        label === "Ischemic stroke" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-700 border-slate-200",
      )}
    >
      {label}
    </Badge>
  )
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const m = {
    correct: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "AI correct" },
    incorrect: { cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "AI incorrect" },
    uncertain: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: HelpCircle, label: "Uncertain" },
  }[verdict]
  const Icon = m.icon
  return (
    <Badge variant="outline" className={cn("gap-1", m.cls)}>
      <Icon className="h-3 w-3" />
      {m.label}
    </Badge>
  )
}

export function ConfidenceBar({ value, threshold }: { value: number; threshold?: number }) {
  const low = threshold !== undefined && value < threshold
  const color = value >= 0.95 ? "bg-emerald-500" : value >= 0.85 ? "bg-sky-500" : value >= 0.7 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums">{(value * 100).toFixed(1)}%</span>
      {low && (
        <span title="Below the configured confidence threshold" className="text-amber-600">
          <AlertTriangle className="h-4 w-4" />
        </span>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children }: { icon?: React.ComponentType<{ className?: string }>; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center">
      {Icon && <Icon className="h-10 w-10 text-muted-foreground mb-3" />}
      <div className="font-medium">{title}</div>
      {children && <div className="text-sm text-muted-foreground mt-1 max-w-md">{children}</div>}
    </div>
  )
}

export const CHART_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#4b5563"]

"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CheckCircle2, MessagesSquare, Plus, RotateCcw, ScanLine, Send } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard-shell"
import { EmptyState, LabelBadge, StatCard, StatusBadge } from "@/components/common"
import { ScanThumb } from "@/components/scan-viewer"
import { NewCaseDialog } from "@/components/new-case-dialog"
import { useDB, useStore } from "@/lib/store"
import { fmtDateTime, fromNow, patientMap } from "@/lib/metrics"
import type { CaseDiscussion } from "@/lib/types"
import { cn } from "@/lib/utils"

const PRIORITY_CLS: Record<CaseDiscussion["priority"], string> = {
  Routine: "bg-slate-100 text-slate-700 border-slate-200",
  Urgent: "bg-amber-100 text-amber-800 border-amber-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
}

export default function CaseReviewsPage() {
  const db = useDB()
  const { user, addComment, setCaseStatus } = useStore()
  const patients = useMemo(() => patientMap(db), [db])
  const [tab, setTab] = useState<"open" | "resolved" | "all">("open")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [reply, setReply] = useState("")

  const order = { Critical: 0, Urgent: 1, Routine: 2 }
  const list = db.cases
    .filter((c) => tab === "all" || c.status === tab)
    .sort((a, b) => order[a.priority] - order[b.priority] || b.createdAt.localeCompare(a.createdAt))
  const selected = db.cases.find((c) => c.id === selectedId) ?? list[0]
  const scan = selected ? db.scans.find((s) => s.id === selected.scanId) : undefined
  const patient = scan ? patients.get(scan.patientId) : undefined

  const send = () => {
    if (!selected || !reply.trim()) return
    addComment(selected.id, reply.trim())
    setReply("")
    toast.success("Comment posted")
  }

  return (
    <div>
      <PageHeader
        title="Case Reviews"
        description="Collaborate on complex or uncertain cases"
        icon={MessagesSquare}
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New case discussion
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Open" value={db.cases.filter((c) => c.status === "open").length} tone="orange" />
        <StatCard label="Critical / urgent open" value={db.cases.filter((c) => c.status === "open" && c.priority !== "Routine").length} tone="red" />
        <StatCard label="Resolved" value={db.cases.filter((c) => c.status === "resolved").length} tone="green" />
        <StatCard label="Started by you" value={db.cases.filter((c) => c.createdBy === user?.name).length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="w-full">
              <TabsTrigger value="open" className="flex-1">
                Open
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex-1">
                Resolved
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {list.length === 0 && <EmptyState title="No cases" />}
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn("w-full rounded-lg border bg-card p-3 text-left transition-colors", selected?.id === c.id ? "ring-2 ring-primary" : "hover:bg-muted/50")}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {c.id} · {c.scanId}
                </span>
                <Badge variant="outline" className={PRIORITY_CLS[c.priority]}>
                  {c.priority}
                </Badge>
              </div>
              <div className="font-medium text-sm">{c.title}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {c.comments.length} comment(s) · {fromNow(c.comments.at(-1)?.at ?? c.createdAt)}
                </span>
                {c.status === "resolved" && <span className="text-emerald-600">Resolved</span>}
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{selected.title}</CardTitle>
                  <CardDescription>
                    Opened by {selected.createdBy} · {fmtDateTime(selected.createdAt)}
                  </CardDescription>
                </div>
                {selected.status === "open" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCaseStatus(selected.id, "resolved")
                      toast.success(`${selected.id} resolved`)
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark resolved
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setCaseStatus(selected.id, "open")}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Reopen
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {scan && (
                <div className="flex flex-col gap-4 rounded-lg border p-3 sm:flex-row">
                  <ScanThumb scan={scan} className="h-36 rounded overflow-hidden sm:w-40" />
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{scan.id}</span> <StatusBadge status={scan.status} />
                      {scan.ai && <LabelBadge label={scan.ai.label} />}
                    </div>
                    {patient && (
                      <div className="text-muted-foreground">
                        {patient.name} · {patient.age} y · NIHSS {patient.nihssAdmission} · {patient.presentingSymptoms}
                      </div>
                    )}
                    {scan.ai && (
                      <div className="text-muted-foreground">
                        AI: {scan.ai.region} · {Math.round(scan.ai.confidence * 100)}% confidence
                      </div>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/radiologist/mri-analysis?scan=${scan.id}`}>
                        <ScanLine className="h-4 w-4 mr-1" /> Open in viewer
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              <ol className="space-y-4">
                {selected.comments.map((cm) => (
                  <li key={cm.id} className={cn("flex gap-3", cm.author === user?.name && "flex-row-reverse")}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {cm.author
                        .replace(/^Dr\. /, "")
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <div className={cn("max-w-[80%] rounded-lg p-3 text-sm", cm.author === user?.name ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      <div className="mb-1 text-xs opacity-80">
                        {cm.author} · {fromNow(cm.at)}
                      </div>
                      {cm.text}
                    </div>
                  </li>
                ))}
                {selected.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
              </ol>

              {selected.status === "open" ? (
                <div className="flex gap-2">
                  <Textarea
                    rows={2}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add your opinion…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send()
                    }}
                  />
                  <Button onClick={send} disabled={!reply.trim()} className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This case is resolved. Reopen it to add comments.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <EmptyState icon={MessagesSquare} title="Select a case" />
        )}
      </div>

      <NewCaseDialog open={newOpen} onOpenChange={setNewOpen} navigate={false} />
    </div>
  )
}

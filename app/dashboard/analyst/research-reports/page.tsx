"use client"

import { useState } from "react"
import { Download, Eye, FilePlus2, FileText, Pencil, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard-shell"
import { StatCard } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { downloadFile, fmtDate } from "@/lib/metrics"
import { buildReport, renderMarkdown } from "@/lib/reports"
import type { Report } from "@/lib/types"

const KINDS: Report["kind"][] = ["Cohort summary", "AI performance", "Interim analysis", "Site comparison"]

export default function ResearchReportsPage() {
  const db = useDB()
  const { addReport, updateReport, deleteReport, can, log } = useStore()
  const [genOpen, setGenOpen] = useState(false)
  const [kind, setKind] = useState<Report["kind"]>("Cohort summary")
  const [title, setTitle] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [draft, setDraft] = useState("")

  const open = db.reports.find((r) => r.id === openId) ?? null
  const reports = [...db.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const generate = () => {
    const r = addReport({
      title: title.trim() || `${kind} – ${new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" })}`,
      kind,
      status: "draft",
      content: buildReport(db, kind),
    })
    toast.success(`${r.id} generated from live data`)
    setGenOpen(false)
    setTitle("")
    setOpenId(r.id)
    setMode("view")
  }

  const download = (r: Report) => {
    if (!can("export_data")) return toast.error("Your role lacks the export permission")
    downloadFile(`${r.id}-${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`, r.content, "text/markdown")
    log("export_report", `Downloaded ${r.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Research Reports"
        description="Generate study reports from live data, edit, publish and download"
        icon={FileText}
        actions={
          <Button onClick={() => setGenOpen(true)}>
            <FilePlus2 className="h-4 w-4 mr-2" /> Generate report
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total reports" value={db.reports.length} />
        <StatCard label="Published" value={db.reports.filter((r) => r.status === "published").length} tone="green" />
        <StatCard label="Drafts" value={db.reports.filter((r) => r.status === "draft").length} tone="orange" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <FileText className="h-7 w-7 text-primary" />
                <Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status}</Badge>
              </div>
              <CardTitle className="mt-2 text-lg">{r.title}</CardTitle>
              <CardDescription>
                {r.kind} · {r.author} · {fmtDate(r.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  setOpenId(r.id)
                  setMode("view")
                }}
              >
                <Eye className="h-4 w-4 mr-1" /> Open
              </Button>
              <Button size="sm" variant="outline" onClick={() => download(r)} aria-label="Download">
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Delete"
                onClick={() => {
                  deleteReport(r.id)
                  toast.success(`${r.id} deleted`)
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>The report is built from the current study data and saved as a draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as Report["kind"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rt">Title (optional)</Label>
              <Input id="rt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${kind} – ${new Date().getFullYear()}`} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generate}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {open.title} <Badge variant={open.status === "published" ? "default" : "secondary"}>{open.status}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {open.id} · {open.kind} · {open.author} · {fmtDate(open.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <Tabs
                value={mode}
                onValueChange={(v) => {
                  if (v === "edit") setDraft(open.content)
                  setMode(v as "view" | "edit")
                }}
              >
                <TabsList>
                  <TabsTrigger value="view">
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </TabsTrigger>
                  <TabsTrigger value="edit">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="view">
                  <article className="rounded-lg border p-5 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(open.content) }} />
                </TabsContent>
                <TabsContent value="edit" className="space-y-2">
                  <Textarea rows={18} className="font-mono text-xs" value={draft} onChange={(e) => setDraft(e.target.value)} />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        updateReport(open.id, { content: draft })
                        toast.success("Report saved")
                        setMode("view")
                      }}
                    >
                      Save changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDraft(buildReport(db, open.kind))
                        toast.info("Regenerated from latest data – save to keep")
                      }}
                    >
                      Regenerate from live data
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => download(open)}>
                  <Download className="h-4 w-4 mr-2" /> Download .md
                </Button>
                {open.status === "draft" ? (
                  <Button
                    onClick={() => {
                      updateReport(open.id, { status: "published" })
                      toast.success("Report published")
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" /> Publish
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => updateReport(open.id, { status: "draft" })}>
                    Unpublish
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

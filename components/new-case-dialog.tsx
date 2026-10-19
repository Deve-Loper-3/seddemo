"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDB, useStore } from "@/lib/store"
import type { CaseDiscussion } from "@/lib/types"

export function NewCaseDialog({
  scanId,
  open,
  onOpenChange,
  navigate = true,
}: {
  scanId?: string
  open: boolean
  onOpenChange: (o: boolean) => void
  navigate?: boolean
}) {
  const db = useDB()
  const { addCase } = useStore()
  const router = useRouter()
  const [scan, setScan] = useState(scanId ?? "")
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<CaseDiscussion["priority"]>("Routine")
  const [text, setText] = useState("")
  const effectiveScan = scanId ?? scan

  const submit = () => {
    if (!effectiveScan || !title.trim()) {
      toast.error("A scan and a title are required")
      return
    }
    addCase({ scanId: effectiveScan, title: title.trim(), priority, firstComment: text.trim() })
    toast.success("Case discussion opened")
    setTitle("")
    setText("")
    onOpenChange(false)
    if (navigate) router.push("/dashboard/radiologist/case-reviews")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open case discussion</DialogTitle>
          <DialogDescription>Ask colleagues for a second opinion on a study.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!scanId && (
            <div className="space-y-2">
              <Label>Scan</Label>
              <Select value={scan} onValueChange={setScan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select scan…" />
                </SelectTrigger>
                <SelectContent>
                  {db.scans
                    .filter((s) => s.ai)
                    .slice(0, 80)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.id} · {s.sequence} · {s.patientId}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="case-title">Title</Label>
            <Input id="case-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Subtle DWI change – second opinion" />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as CaseDiscussion["priority"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Routine">Routine</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="case-text">Question / first comment</Label>
            <Textarea id="case-text" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Open case</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

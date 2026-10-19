"use client"

import { useEffect, useState } from "react"
import { Save, Settings } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/dashboard-shell"
import { useDB, useStore } from "@/lib/store"
import type { Settings as S } from "@/lib/types"

const MODEL_VERSIONS = ["StrokeNet v2.1", "StrokeNet v2.2", "StrokeNet v2.3 (ensemble)"]

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b py-4 last:border-0 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{hint}</div>
      </div>
      <div className="md:w-72">{children}</div>
    </div>
  )
}

export default function SystemSettingsPage() {
  const db = useDB()
  const { updateSettings } = useStore()
  const [s, setS] = useState<S>(db.settings)
  useEffect(() => setS(db.settings), [db.settings])

  const dirty = JSON.stringify(s) !== JSON.stringify(db.settings)
  const set = <K extends keyof S>(k: K, v: S[K]) => setS((x) => ({ ...x, [k]: v }))

  const save = () => {
    const changed = (Object.keys(s) as (keyof S)[]).filter((k) => s[k] !== db.settings[k])
    if (!s.studyName.trim()) return toast.error("Study name is required")
    updateSettings(Object.fromEntries(changed.map((k) => [k, s[k]])) as Partial<S>)
    toast.success(`Saved ${changed.length} setting(s)`)
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="System Settings"
        description="Changes apply immediately for every user of the platform"
        icon={Settings}
        actions={
          <>
            <Button variant="outline" disabled={!dirty} onClick={() => setS(db.settings)}>
              Discard
            </Button>
            <Button onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4 mr-2" /> Save changes
            </Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Study</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Study name" hint="Shown on every dashboard.">
            <Input value={s.studyName} onChange={(e) => set("studyName", e.target.value)} />
          </Row>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI pipeline</CardTitle>
          <CardDescription>Controls the simulated inference service</CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Active model version" hint="Used for every new prediction.">
            <Select value={s.activeModelVersion} onValueChange={(v) => set("activeModelVersion", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_VERSIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row
            label={`Low-confidence threshold: ${Math.round(s.aiConfidenceThreshold * 100)}%`}
            hint="Predictions below this are flagged with a warning icon in review queues."
          >
            <Slider value={[s.aiConfidenceThreshold]} min={0.5} max={0.99} step={0.01} onValueChange={([v]) => set("aiConfidenceThreshold", v)} />
          </Row>
          <Row label="Run AI automatically on upload" hint="When off, uploads wait in “AI processing” until this is re-enabled.">
            <Switch checked={s.autoRunAI} onCheckedChange={(v) => set("autoRunAI", v)} />
          </Row>
          <Row label="Require expert validation" hint="When off, a radiologist review finalises the case without the doctor step.">
            <Switch checked={s.requireDoubleReview} onCheckedChange={(v) => set("requireDoubleReview", v)} />
          </Row>
          <Row label="Max upload size (MB)" hint="Enforced on the Scan Upload page.">
            <Input type="number" min={1} max={100} value={s.maxUploadMb} onChange={(e) => set("maxUploadMb", Math.max(1, Number(e.target.value) || 1))} />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Session timeout (minutes)" hint="Informational in this demo.">
            <Input type="number" min={5} max={240} value={s.sessionTimeoutMin} onChange={(e) => set("sessionTimeoutMin", Number(e.target.value) || 30)} />
          </Row>
          <Row label="Email notifications" hint="Notify reviewers when new cases enter their queue (simulated).">
            <Switch checked={s.emailNotifications} onCheckedChange={(v) => set("emailNotifications", v)} />
          </Row>
          <Row label="Maintenance mode" hint="Blocks sign-in for everyone except administrators.">
            <Switch checked={s.maintenanceMode} onCheckedChange={(v) => set("maintenanceMode", v)} />
          </Row>
        </CardContent>
      </Card>
    </div>
  )
}

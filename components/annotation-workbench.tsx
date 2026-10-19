"use client"

import { useState } from "react"
import { Eraser, Eye, EyeOff, Pencil, Save, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScanViewer, type Overlay } from "@/components/scan-viewer"
import { useDB, useStore } from "@/lib/store"
import { fromNow } from "@/lib/metrics"
import type { Scan, Stroke } from "@/lib/types"
import { cn } from "@/lib/utils"

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#facc15", "#ffffff"]

export function AnnotationWorkbench({ scan, showOverlayPicker = false, defaultRetraining = false }: { scan: Scan; showOverlayPicker?: boolean; defaultRetraining?: boolean }) {
  const db = useDB()
  const { addAnnotation, can } = useStore()
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [drawing, setDrawing] = useState(true)
  const [color, setColor] = useState(COLORS[0])
  const [width, setWidth] = useState(3)
  const [overlay, setOverlay] = useState<Overlay>(showOverlayPicker ? "nnU-Net" : "none")
  const [note, setNote] = useState("")
  const [retrain, setRetrain] = useState(defaultRetraining)
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const saved = db.annotations.filter((a) => a.scanId === scan.id)
  const visibleSaved = saved.filter((a) => !hidden.has(a.id)).flatMap((a) => a.strokes)
  const allowed = can("annotate")

  const save = () => {
    if (strokes.length === 0) {
      toast.error("Draw at least one lesion outline first")
      return
    }
    addAnnotation({ scanId: scan.id, strokes, note: note.trim(), forRetraining: retrain, baseOverlay: overlay })
    toast.success(retrain ? "Annotation saved and queued for model retraining" : "Annotation saved")
    setStrokes([])
    setNote("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <ScanViewer
        key={scan.id}
        scan={scan}
        overlay={overlay}
        defaultHeatmap={!showOverlayPicker}
        strokes={[...visibleSaved, ...strokes]}
        draw={drawing && allowed ? { color, width, onStroke: (s) => setStrokes((x) => [...x, s]) } : undefined}
      />

      <div className="space-y-5">
        {!allowed && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Your role does not currently have the “annotate” permission.</p>}

        {showOverlayPicker && (
          <div className="space-y-2">
            <Label>Segmentation overlay</Label>
            <ToggleGroup type="single" value={overlay} onValueChange={(v) => v && setOverlay(v as Overlay)} variant="outline" className="w-full">
              <ToggleGroupItem value="none" className="flex-1">
                None
              </ToggleGroupItem>
              <ToggleGroupItem value="U-Net" className="flex-1">
                U-Net
              </ToggleGroupItem>
              <ToggleGroupItem value="nnU-Net" className="flex-1">
                nnU-Net
              </ToggleGroupItem>
            </ToggleGroup>
            {scan.ai && overlay !== "none" && (
              <p className="text-xs text-muted-foreground">
                Dice vs. reference: <strong>{scan.ai.segmentationDice[overlay]}</strong>
                {scan.ai.segmentationDice[overlay] === 0 && " (no lesion segmented)"}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Drawing tools</Label>
            <Button size="sm" variant={drawing ? "default" : "outline"} onClick={() => setDrawing((d) => !d)} disabled={!allowed}>
              <Pencil className="h-4 w-4 mr-1" /> {drawing ? "Drawing on" : "Drawing off"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Colour ${c}`}
                className={cn("h-7 w-7 rounded-full border-2", color === c ? "border-foreground scale-110" : "border-muted")}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-16">Brush {width}px</span>
            <Slider value={[width]} min={1} max={10} step={1} onValueChange={([v]) => setWidth(v)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={!strokes.length}>
              <Undo2 className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStrokes([])} disabled={!strokes.length}>
              <Eraser className="h-4 w-4 mr-1" /> Clear
            </Button>
            <span className="text-xs text-muted-foreground self-center">{strokes.length} unsaved stroke(s)</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ann-note">Annotation note</Label>
          <Textarea id="ann-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Lesion extends further posteriorly than AI mask" />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="retrain" checked={retrain} onCheckedChange={setRetrain} />
          <Label htmlFor="retrain" className="text-sm">
            Submit correction for model retraining
          </Label>
        </div>
        <Button className="w-full" onClick={save} disabled={!allowed}>
          <Save className="h-4 w-4 mr-2" /> Save annotation
        </Button>

        <div>
          <Label className="mb-2 block">Saved annotations ({saved.length})</Label>
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet for this scan.</p>
          ) : (
            <ul className="space-y-2">
              {saved.map((a) => (
                <li key={a.id} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                  <button
                    onClick={() =>
                      setHidden((h) => {
                        const n = new Set(h)
                        if (n.has(a.id)) n.delete(a.id)
                        else n.add(a.id)
                        return n
                      })
                    }
                    aria-label="Toggle visibility"
                    className="mt-0.5 text-muted-foreground"
                  >
                    {hidden.has(a.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <div className="font-medium">
                      {a.author} <span className="font-normal text-muted-foreground">· {fromNow(a.createdAt)}</span>
                    </div>
                    {a.note && <div className="text-muted-foreground">{a.note}</div>}
                    <div className="text-xs text-muted-foreground">
                      {a.strokes.length} stroke(s){a.baseOverlay && a.baseOverlay !== "none" ? ` · on ${a.baseOverlay}` : ""}
                      {a.forRetraining ? " · queued for retraining" : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

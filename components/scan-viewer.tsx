"use client"

import { useRef, useState } from "react"
import { Contrast, Flame, Minus, Plus, RotateCcw, SunMedium } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Lesion, Point, Scan, Stroke } from "@/lib/types"
import { findSample } from "@/lib/images"
import { cn } from "@/lib/utils"

export type Overlay = "none" | "U-Net" | "nnU-Net"

type Props = {
  scan: Scan
  className?: string
  /** show the window/level toolbar */
  controls?: boolean
  defaultHeatmap?: boolean
  overlay?: Overlay
  /** strokes to render on top of the image (saved annotations) */
  strokes?: Stroke[]
  /** enable freehand drawing; parent owns the stroke list */
  draw?: { color: string; width: number; onStroke: (s: Stroke) => void }
  /** override the lesion rendered by the heatmap (defaults to the AI's) */
  lesion?: Lesion
}

export function ScanViewer({ scan, className, controls = true, defaultHeatmap = true, overlay = "none", strokes = [], draw, lesion }: Props) {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [zoom, setZoom] = useState(1)
  const [invert, setInvert] = useState(false)
  const [heatmap, setHeatmap] = useState(defaultHeatmap)
  const [aspect, setAspect] = useState(1)
  const [current, setCurrent] = useState<Point[] | null>(null)
  const surface = useRef<HTMLDivElement>(null)

  const l = lesion ?? scan.ai?.lesion
  const sample = findSample(scan.image)

  const toPoint = (e: React.PointerEvent): Point => {
    const r = surface.current!.getBoundingClientRect()
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]
  }

  // segmentation contours: nnU-Net hugs the lesion, U-Net is a little looser and offset
  const seg = l && overlay !== "none" ? (overlay === "nnU-Net" ? { ...l, r: l.r * 1.02 } : { x: l.x + 0.015, y: l.y - 0.01, r: l.r * 1.18 }) : null

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-lg bg-black">
        <div className="relative mx-auto transition-transform duration-150" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scan.image}
            alt={`${scan.sequence} MRI ${scan.id}`}
            className="block w-full h-auto max-h-[70vh] object-contain select-none"
            draggable={false}
            onLoad={(e) => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
            style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}` }}
          />
          <div
            ref={surface}
            className={cn("absolute inset-0", draw && "cursor-crosshair touch-none")}
            onPointerDown={(e) => {
              if (!draw) return
              e.currentTarget.setPointerCapture(e.pointerId)
              setCurrent([toPoint(e)])
            }}
            onPointerMove={(e) => {
              if (!draw || !current) return
              setCurrent((c) => (c ? [...c, toPoint(e)] : c))
            }}
            onPointerUp={() => {
              if (!draw || !current) return
              if (current.length > 1) draw.onStroke({ points: current, color: draw.color, width: draw.width })
              setCurrent(null)
            }}
          >
            <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
              <defs>
                <radialGradient id={`heat-${scan.id}`}>
                  <stop offset="0%" stopColor="#ff1f1f" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#ff8a00" stopOpacity="0.55" />
                  <stop offset="75%" stopColor="#ffe600" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffe600" stopOpacity="0" />
                </radialGradient>
              </defs>
              {heatmap && l && <ellipse cx={l.x} cy={l.y} rx={l.r * 1.6} ry={l.r * 1.6 * aspect} fill={`url(#heat-${scan.id})`} style={{ mixBlendMode: "screen" }} />}
              {seg && (
                <ellipse
                  cx={seg.x}
                  cy={seg.y}
                  rx={seg.r}
                  ry={seg.r * aspect * 1.1}
                  fill={overlay === "nnU-Net" ? "rgba(34,197,94,0.18)" : "rgba(59,130,246,0.18)"}
                  stroke={overlay === "nnU-Net" ? "#22c55e" : "#3b82f6"}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {[...strokes, ...(current && draw ? [{ points: current, color: draw.color, width: draw.width }] : [])].map((s, i) => (
                <polyline
                  key={i}
                  points={s.points.map((p) => p.join(",")).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>
        </div>
        <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-white/90">
          {scan.id} · {scan.sequence} · {scan.slices} slices
        </div>
        {heatmap && l && (
          <div className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[11px] text-white/90">AI attention map</div>
        )}
      </div>

      {sample && (
        <p className="text-[11px] text-muted-foreground">
          Image: {sample.credit} —{" "}
          <a href={sample.source} target="_blank" rel="noreferrer" className="underline">
            source
          </a>
        </p>
      )}

      {controls && (
        <div className="grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <SunMedium className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider value={[brightness]} min={40} max={200} step={5} onValueChange={([v]) => setBrightness(v)} aria-label="Brightness" />
          </div>
          <div className="flex items-center gap-3">
            <Contrast className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider value={[contrast]} min={40} max={250} step={5} onValueChange={([v]) => setContrast(v)} aria-label="Contrast" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(1, z - 0.25))} aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setBrightness(100)
                setContrast(100)
                setZoom(1)
                setInvert(false)
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id={`inv-${scan.id}`} checked={invert} onCheckedChange={setInvert} />
              <Label htmlFor={`inv-${scan.id}`} className="text-sm">
                Invert
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id={`heat-${scan.id}`} checked={heatmap} onCheckedChange={setHeatmap} disabled={!l} />
              <Label htmlFor={`heat-${scan.id}`} className="text-sm flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Heatmap
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Small preview with an AI lesion marker positioned relative to the image itself. */
export function ScanThumb({ scan, className, marker = true }: { scan: Scan; className?: string; marker?: boolean }) {
  const l = scan.ai?.lesion
  return (
    <div className={cn("flex justify-center bg-black", className ?? "h-48")}>
      <div className="relative h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scan.image} alt={scan.id} className="h-full w-auto max-w-none" />
        {marker && l && (
          <span
            className="absolute rounded-full bg-red-500/25 ring-2 ring-red-500 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, width: `${l.r * 200}%`, aspectRatio: "1" }}
          />
        )}
      </div>
    </div>
  )
}

import { format, formatDistanceToNow } from "date-fns"
import type { DB, ModelName, Patient, Scan, StrokeLabel } from "./types"

export type Confusion = { tp: number; fp: number; tn: number; fn: number }

export function groundTruth(s: Scan): StrokeLabel | undefined {
  return s.expertValidation?.finalLabel ?? s.radiologistReview?.finalLabel
}

/** Scans with both an AI prediction and a human-adjudicated label. */
export function adjudicated(scans: Scan[]) {
  return scans.filter((s) => s.ai && groundTruth(s))
}

export function confusion(scans: Scan[], predicted: (s: Scan) => boolean = (s) => s.ai!.label === "Ischemic stroke"): Confusion {
  const c: Confusion = { tp: 0, fp: 0, tn: 0, fn: 0 }
  for (const s of adjudicated(scans)) {
    const truth = groundTruth(s) === "Ischemic stroke"
    const pred = predicted(s)
    if (pred && truth) c.tp++
    else if (pred && !truth) c.fp++
    else if (!pred && truth) c.fn++
    else c.tn++
  }
  return c
}

const safe = (n: number, d: number) => (d === 0 ? 0 : n / d)

export function scores(c: Confusion) {
  const total = c.tp + c.fp + c.tn + c.fn
  const sensitivity = safe(c.tp, c.tp + c.fn)
  const precision = safe(c.tp, c.tp + c.fp)
  return {
    total,
    accuracy: safe(c.tp + c.tn, total),
    sensitivity,
    specificity: safe(c.tn, c.tn + c.fp),
    precision,
    npv: safe(c.tn, c.tn + c.fn),
    f1: safe(2 * precision * sensitivity, precision + sensitivity),
  }
}

export function modelScores(scans: Scan[], model: ModelName, threshold = 0.5) {
  return scores(confusion(scans, (s) => s.ai!.modelProbs[model] >= threshold))
}

/** ROC curve points for one model across thresholds. */
export function roc(scans: Scan[], model: ModelName) {
  const pts: { fpr: number; tpr: number; t: number }[] = []
  for (let t = 1.0; t >= -0.001; t -= 0.05) {
    const s = scores(confusion(scans, (x) => x.ai!.modelProbs[model] >= t))
    pts.push({ fpr: round(1 - s.specificity, 3), tpr: round(s.sensitivity, 3), t: round(t, 2) })
  }
  let auc = 0
  for (let i = 1; i < pts.length; i++) auc += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2
  return { pts, auc: round(auc, 3) }
}

export const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d
export const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`

export const fmtDate = (iso?: string) => (iso ? format(new Date(iso), "d MMM yyyy") : "—")
export const fmtDateTime = (iso?: string) => (iso ? format(new Date(iso), "d MMM yyyy, HH:mm") : "—")
export const fromNow = (iso?: string) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : "—")

export function patientMap(db: DB) {
  return new Map<string, Patient>(db.patients.map((p) => [p.id, p]))
}

export function groupCount<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>()
  items.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1))
  return [...m.entries()].map(([name, value]) => ({ name, value }))
}

export function ageBand(age: number) {
  if (age < 45) return "<45"
  if (age < 55) return "45–54"
  if (age < 65) return "55–64"
  if (age < 75) return "65–74"
  return "75+"
}
export const AGE_BANDS = ["<45", "45–54", "55–64", "65–74", "75+"]

export function monthKey(iso: string) {
  return format(new Date(iso), "yyyy-MM")
}
export function lastMonths(n: number) {
  const out: { key: string; label: string }[] = []
  const d = new Date()
  d.setDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push({ key: format(x, "yyyy-MM"), label: format(x, "MMM yy") })
  }
  return out
}

// ---------- downloads ----------
export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function toCSV(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? "" : Array.isArray(v) ? v.join("; ") : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n")
}

/** Read an image file and downscale it so it fits comfortably in localStorage. */
export function fileToDataUrl(file: File, maxSize = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("File is not a browser-readable image (use PNG/JPG; DICOM is simulated)"))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

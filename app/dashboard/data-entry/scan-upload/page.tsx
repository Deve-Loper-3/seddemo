"use client"

import type React from "react"
import { Suspense, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Clock, FileImage, ImageIcon, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard-shell"
import { LabelBadge, StatCard, StatusBadge } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { SAMPLE_IMAGES } from "@/lib/images"
import { fileToDataUrl, fromNow } from "@/lib/metrics"
import type { Sequence } from "@/lib/types"
import { cn } from "@/lib/utils"

const SEQUENCES: Sequence[] = ["DWI", "ADC", "FLAIR", "T2", "T1", "MRA"]

function ScanUploadInner() {
  const db = useDB()
  const { addScan, deleteScan, user } = useStore()
  const params = useSearchParams()
  const [patientId, setPatientId] = useState(params.get("patient") ?? "")
  const [sequence, setSequence] = useState<Sequence>("DWI")
  const [slices, setSlices] = useState(24)
  const [source, setSource] = useState<"file" | "sample">("sample")
  const [file, setFile] = useState<{ name: string; sizeMb: number; dataUrl: string } | null>(null)
  const [sample, setSample] = useState<string>(SAMPLE_IMAGES[0].src)
  const [dragActive, setDragActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const patients = useMemo(() => [...db.patients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [db.patients])
  const recent = db.scans.slice().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 10)
  const today = new Date().toDateString()

  const acceptFile = async (f: File) => {
    const maxMb = db.settings.maxUploadMb
    if (f.size > maxMb * 1024 * 1024) {
      toast.error(`File is larger than the ${maxMb} MB limit set by the administrator`)
      return
    }
    if (/\.(dcm|dicom)$/i.test(f.name)) {
      toast.error("DICOM decoding isn't available in this demo – export the slice as PNG/JPG, or pick a sample study.")
      return
    }
    try {
      setBusy(true)
      const dataUrl = await fileToDataUrl(f)
      setFile({ name: f.name, sizeMb: Math.round((f.size / 1024 / 1024) * 10) / 10, dataUrl })
      setSource("file")
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) acceptFile(f)
  }

  const submit = () => {
    if (!patientId) {
      toast.error("Select the patient this study belongs to")
      return
    }
    const chosen = SAMPLE_IMAGES.find((s) => s.src === sample)
    const image = source === "file" ? file?.dataUrl : sample
    if (!image) {
      toast.error("Choose a file to upload")
      return
    }
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const scan = addScan({
      patientId,
      sequence: source === "sample" && chosen ? chosen.sequence : sequence,
      image,
      fileName: source === "file" ? file!.name : `${patientId}_${chosen?.sequence ?? sequence}_${stamp}.dcm`,
      fileSizeMb: source === "file" ? file!.sizeMb : Math.round((12 + Math.random() * 20) * 10) / 10,
      slices,
    })
    toast.success(`${scan.id} uploaded – AI analysis started`)
    setFile(null)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Scan Upload" description="Upload MRI studies and send them to the AI pipeline" icon={Upload} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Uploads today" value={db.scans.filter((s) => new Date(s.uploadedAt).toDateString() === today).length} icon={Upload} />
        <StatCard label="My uploads" value={db.scans.filter((s) => s.uploadedBy === user?.name).length} icon={FileImage} />
        <StatCard label="AI processing" value={db.scans.filter((s) => s.status === "processing").length} icon={Clock} tone="orange" />
        <StatCard label="Analysed by AI" value={db.scans.filter((s) => s.ai).length} icon={CheckCircle} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload MRI study</CardTitle>
            <CardDescription>Choose the patient, then provide an image or pick one of the bundled sample studies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-3">
                <Label>Patient *</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient…" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.id} – {p.name} ({p.site.split(" – ")[1]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sequence</Label>
                <Select value={sequence} onValueChange={(v) => setSequence(v as Sequence)} disabled={source === "sample"}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEQUENCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slices">Slices</Label>
                <Input id="slices" type="number" min={1} max={200} value={slices} onChange={(e) => setSlices(Number(e.target.value) || 1)} />
              </div>
            </div>

            <Tabs value={source} onValueChange={(v) => setSource(v as "file" | "sample")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sample">Sample study</TabsTrigger>
                <TabsTrigger value="file">Upload file</TabsTrigger>
              </TabsList>
              <TabsContent value="sample" className="pt-3">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {SAMPLE_IMAGES.map((s) => (
                    <button
                      key={s.src}
                      type="button"
                      onClick={() => setSample(s.src)}
                      title={s.title}
                      className={cn("relative overflow-hidden rounded-md border-2 bg-black", sample === s.src ? "border-primary" : "border-transparent opacity-80 hover:opacity-100")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.src} alt={s.title} className="aspect-square w-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[10px] text-white">{s.sequence}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{SAMPLE_IMAGES.find((s) => s.src === sample)?.title}</p>
              </TabsContent>
              <TabsContent value="file" className="pt-3">
                {file ? (
                  <div className="flex items-center gap-4 rounded-lg border p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.dataUrl} alt="preview" className="h-20 w-20 rounded object-cover bg-black" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-muted-foreground">{file.sizeMb} MB</div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setFile(null)} aria-label="Remove file">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer",
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <div className="font-medium mb-1">{busy ? "Reading file…" : "Drop an MRI image here"}</div>
                    <div className="text-sm text-muted-foreground mb-3">or click to browse</div>
                    <div className="text-xs text-muted-foreground">PNG / JPG exported slices, max {db.settings.maxUploadMb} MB</div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*,.dcm,.dicom"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) acceptFile(f)
                        e.target.value = ""
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Button className="w-full" size="lg" onClick={submit} disabled={busy}>
              <Upload className="h-4 w-4 mr-2" /> Upload & run AI analysis
            </Button>
            {!db.settings.autoRunAI && (
              <p className="text-xs text-amber-700">Automatic AI analysis is disabled in System Settings – uploads will wait in “AI processing”.</p>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent uploads</CardTitle>
            <CardDescription>Status updates live as the AI finishes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recent.map((s) => {
                const p = db.patients.find((x) => x.id === s.patientId)
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="" className="h-12 w-12 rounded object-cover bg-black" />
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="font-medium truncate">
                        {s.id} · {s.sequence}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p?.name ?? s.patientId} · {fromNow(s.uploadedAt)}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <StatusBadge status={s.status} />
                        {s.ai && <LabelBadge label={s.ai.label} />}
                      </div>
                    </div>
                    {s.uploadedBy === user?.name && s.status !== "validated" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete upload"
                        onClick={() => {
                          deleteScan(s.id)
                          toast.success(`${s.id} deleted`)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ScanUploadPage() {
  return (
    <Suspense fallback={null}>
      <ScanUploadInner />
    </Suspense>
  )
}

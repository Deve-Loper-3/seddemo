"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Patient, Sex, Treatment } from "@/lib/types"

export const COMORBIDITY_OPTIONS = [
  "Hypertension",
  "Diabetes mellitus",
  "Atrial fibrillation",
  "Dyslipidemia",
  "Smoking",
  "Prior stroke/TIA",
  "Sickle cell disease",
  "HIV",
]
export const TREATMENT_OPTIONS: Treatment[] = ["IV thrombolysis (tPA)", "Mechanical thrombectomy", "tPA + thrombectomy", "Antiplatelet / supportive"]
const STATUS_OPTIONS: Patient["status"][] = ["Admitted", "Discharged", "Follow-up", "Deceased"]

export type PatientInput = Omit<Patient, "id" | "createdAt" | "updatedAt" | "createdBy">

const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function emptyPatient(site: string): PatientInput {
  return {
    name: "",
    age: NaN,
    sex: "Male",
    site,
    admittedAt: new Date().toISOString(),
    symptomOnsetHours: NaN,
    nihssAdmission: NaN,
    comorbidities: [],
    presentingSymptoms: "",
    status: "Admitted",
    notes: "",
  }
}

export function PatientForm({
  initial,
  sites,
  showOutcomes = false,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: PatientInput
  sites: string[]
  showOutcomes?: boolean
  submitLabel: string
  onSubmit: (p: PatientInput) => void
  onCancel?: () => void
}) {
  const [f, setF] = useState<PatientInput>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof PatientInput>(k: K, v: PatientInput[K]) => setF((x) => ({ ...x, [k]: v }))
  const num = (v: string) => (v === "" ? NaN : Number(v))
  const numVal = (n?: number) => (n === undefined || Number.isNaN(n) ? "" : String(n))

  const validate = () => {
    const e: Record<string, string> = {}
    if (f.name.trim().length < 3) e.name = "Enter the patient's full name"
    if (!(f.age >= 18 && f.age <= 110)) e.age = "Age must be 18–110"
    if (!(f.nihssAdmission >= 0 && f.nihssAdmission <= 42)) e.nihss = "NIHSS must be 0–42"
    if (!(f.symptomOnsetHours >= 0 && f.symptomOnsetHours <= 168)) e.onset = "0–168 hours"
    if (!f.presentingSymptoms.trim()) e.symptoms = "Describe the presenting symptoms"
    if (f.mrs90 !== undefined && !Number.isNaN(f.mrs90) && !(f.mrs90 >= 0 && f.mrs90 <= 6)) e.mrs = "mRS must be 0–6"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="text-xs text-red-600">{errors[k]}</p> : null)

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!validate()) return
        const clean = { ...f, name: f.name.trim() }
        if (clean.mrs90 !== undefined && Number.isNaN(clean.mrs90)) clean.mrs90 = undefined
        if (clean.nihssDischarge !== undefined && Number.isNaN(clean.nihssDischarge)) clean.nihssDischarge = undefined
        if (clean.lengthOfStayDays !== undefined && Number.isNaN(clean.lengthOfStayDays)) clean.lengthOfStayDays = undefined
        onSubmit(clean)
      }}
    >
      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Demographics</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pf-name">Full name *</Label>
            <Input id="pf-name" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ngozi Adeyemi" />
            <Err k="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-age">Age *</Label>
            <Input id="pf-age" type="number" value={numVal(f.age)} onChange={(e) => set("age", num(e.target.value))} />
            <Err k="age" />
          </div>
          <div className="space-y-2">
            <Label>Sex *</Label>
            <Select value={f.sex} onValueChange={(v) => set("sex", v as Sex)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Study site *</Label>
            <Select value={f.site} onValueChange={(v) => set("site", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-adm">Admission date & time *</Label>
            <Input
              id="pf-adm"
              type="datetime-local"
              value={toLocalInput(f.admittedAt)}
              onChange={(e) => e.target.value && set("admittedAt", new Date(e.target.value).toISOString())}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold mb-2">Clinical presentation</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-nihss">NIHSS on admission (0–42) *</Label>
            <Input id="pf-nihss" type="number" value={numVal(f.nihssAdmission)} onChange={(e) => set("nihssAdmission", num(e.target.value))} />
            <Err k="nihss" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-onset">Symptom onset → scan (hours) *</Label>
            <Input id="pf-onset" type="number" step="0.1" value={numVal(f.symptomOnsetHours)} onChange={(e) => set("symptomOnsetHours", num(e.target.value))} />
            <Err k="onset" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pf-sym">Presenting symptoms *</Label>
            <Textarea id="pf-sym" rows={2} value={f.presentingSymptoms} onChange={(e) => set("presentingSymptoms", e.target.value)} placeholder="e.g. Right-sided weakness and aphasia" />
            <Err k="symptoms" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Risk factors / comorbidities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {COMORBIDITY_OPTIONS.map((c) => (
                <Label key={c} className="flex items-center gap-2 font-normal text-sm cursor-pointer">
                  <Checkbox
                    checked={f.comorbidities.includes(c)}
                    onCheckedChange={(on) => set("comorbidities", on ? [...f.comorbidities, c] : f.comorbidities.filter((x) => x !== c))}
                  />
                  {c}
                </Label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      {showOutcomes && (
        <fieldset className="space-y-4">
          <legend className="font-semibold mb-2">Treatment & outcome</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={f.status} onValueChange={(v) => set("status", v as Patient["status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Treatment</Label>
              <Select value={f.treatment ?? "none"} onValueChange={(v) => set("treatment", v === "none" ? undefined : (v as Treatment))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not recorded</SelectItem>
                  {TREATMENT_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-nd">NIHSS at discharge</Label>
              <Input id="pf-nd" type="number" value={numVal(f.nihssDischarge)} onChange={(e) => set("nihssDischarge", num(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-mrs">90-day mRS (0–6)</Label>
              <Input id="pf-mrs" type="number" value={numVal(f.mrs90)} onChange={(e) => set("mrs90", num(e.target.value))} />
              <Err k="mrs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-los">Length of stay (days)</Label>
              <Input id="pf-los" type="number" value={numVal(f.lengthOfStayDays)} onChange={(e) => set("lengthOfStayDays", num(e.target.value))} />
            </div>
          </div>
        </fieldset>
      )}

      <div className="space-y-2">
        <Label htmlFor="pf-notes">Notes</Label>
        <Textarea id="pf-notes" rows={2} value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, FileText, Upload, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard-shell"
import { emptyPatient, PatientForm } from "@/components/patient-form"
import { useDB, useStore } from "@/lib/store"
import { fromNow } from "@/lib/metrics"
import type { Patient } from "@/lib/types"

export default function DataEntryFormsPage() {
  const db = useDB()
  const { user, addPatient } = useStore()
  const [created, setCreated] = useState<Patient | null>(null)
  const [formKey, setFormKey] = useState(0)

  const mine = db.patients.filter((p) => p.createdBy === user?.name).slice(0, 8)

  return (
    <div>
      <PageHeader title="Data Entry Forms" description="Register a new patient enrolled in the study" icon={FileText} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{created ? "Patient registered" : "New patient registration"}</CardTitle>
            <CardDescription>Fields marked * are required by the study protocol.</CardDescription>
          </CardHeader>
          <CardContent>
            {created ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
                <div>
                  <div className="text-xl font-semibold">{created.name}</div>
                  <div className="text-muted-foreground">
                    Assigned study ID <span className="font-mono font-semibold text-foreground">{created.id}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Next step: upload the patient's MRI so the AI and radiologists can review it.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href={`/dashboard/data-entry/scan-upload?patient=${created.id}`}>
                      <Upload className="h-4 w-4 mr-2" /> Upload MRI for {created.id}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreated(null)
                      setFormKey((k) => k + 1)
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Register another patient
                  </Button>
                </div>
              </div>
            ) : (
              <PatientForm
                key={formKey}
                initial={emptyPatient(user?.site ?? db.sites[0])}
                sites={db.sites}
                submitLabel="Register patient"
                onSubmit={(input) => {
                  const p = addPatient(input)
                  toast.success(`${p.id} registered`)
                  setCreated(p)
                }}
                onCancel={() => setFormKey((k) => k + 1)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Recently registered by you</CardTitle>
          </CardHeader>
          <CardContent>
            {mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <ul className="divide-y">
                {mine.map((p) => {
                  const scans = db.scans.filter((s) => s.patientId === p.id).length
                  return (
                    <li key={p.id} className="py-2 text-sm flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.id} · {fromNow(p.createdAt)}
                        </div>
                      </div>
                      {scans === 0 ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/data-entry/scan-upload?patient=${p.id}`}>Add MRI</Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{scans} scan(s)</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

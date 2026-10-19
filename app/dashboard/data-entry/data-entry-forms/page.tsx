"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, FileText, Save, Plus } from "lucide-react"

export default function DataEntryFormsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    patientId: "",
    age: "",
    gender: "",
    admissionDate: "",
    symptoms: "",
    nihssScore: "",
    scanType: "",
    strokeType: "",
  })

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "data-entry") {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Form submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/data-entry">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Data Entry Forms</h1>
        </div>
        <p className="text-muted-foreground mb-8">Input patient information and scan data</p>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">47</div>
              <div className="text-sm text-muted-foreground">Entries Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">98.3%</div>
              <div className="text-sm text-muted-foreground">Data Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Patient Entry</CardTitle>
            <CardDescription>Enter patient demographics and clinical information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID *</Label>
                  <Input
                    id="patientId"
                    placeholder="PT-XXXX"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="65"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Presenting Symptoms *</Label>
                <textarea
                  id="symptoms"
                  className="w-full min-h-24 px-3 py-2 rounded-md border border-input bg-background"
                  placeholder="Describe patient symptoms..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nihssScore">NIHSS Score</Label>
                  <Input
                    id="nihssScore"
                    type="number"
                    placeholder="0-42"
                    value={formData.nihssScore}
                    onChange={(e) => setFormData({ ...formData, nihssScore: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scanType">Scan Type *</Label>
                  <select
                    id="scanType"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.scanType}
                    onChange={(e) => setFormData({ ...formData, scanType: e.target.value })}
                    required
                  >
                    <option value="">Select scan type</option>
                    <option value="dwi">DWI/ADC</option>
                    <option value="flair">FLAIR</option>
                    <option value="t2">T2-weighted</option>
                    <option value="t1">T1-weighted</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strokeType">Stroke Classification</Label>
                <select
                  id="strokeType"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.strokeType}
                  onChange={(e) => setFormData({ ...formData, strokeType: e.target.value })}
                >
                  <option value="">Select classification</option>
                  <option value="acute-ischemic">Acute Ischemic</option>
                  <option value="subacute">Subacute Infarct</option>
                  <option value="chronic">Chronic Infarct</option>
                  <option value="hemorrhagic">Hemorrhagic</option>
                  <option value="none">No Acute Findings</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Save & Add Another
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

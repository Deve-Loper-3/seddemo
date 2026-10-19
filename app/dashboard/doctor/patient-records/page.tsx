"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Activity, Calendar } from "lucide-react"

const PATIENT_RECORDS = [
  {
    id: "PR-2024-001",
    patientName: "John Anderson",
    mrn: "MRN-789456",
    age: 67,
    gender: "Male",
    bloodType: "A+",
    admissionDate: "2024-01-15",
    medicalHistory: ["Hypertension", "Type 2 Diabetes", "Atrial Fibrillation"],
    medications: ["Warfarin", "Metformin", "Lisinopril"],
    allergies: ["Penicillin"],
    lastVisit: "2024-01-15",
    totalVisits: 3,
  },
  {
    id: "PR-2024-002",
    patientName: "Maria Garcia",
    mrn: "MRN-654321",
    age: 54,
    gender: "Female",
    bloodType: "O+",
    admissionDate: "2024-01-14",
    medicalHistory: ["Hyperlipidemia", "Migraine"],
    medications: ["Atorvastatin", "Aspirin"],
    allergies: ["None"],
    lastVisit: "2024-01-14",
    totalVisits: 2,
  },
  {
    id: "PR-2024-003",
    patientName: "Robert Chen",
    mrn: "MRN-987123",
    age: 72,
    gender: "Male",
    bloodType: "B+",
    admissionDate: "2024-01-13",
    medicalHistory: ["Coronary Artery Disease", "Hypertension", "Previous MI"],
    medications: ["Clopidogrel", "Metoprolol", "Atorvastatin"],
    allergies: ["Sulfa drugs"],
    lastVisit: "2024-01-13",
    totalVisits: 5,
  },
  {
    id: "PR-2024-004",
    patientName: "Sarah Williams",
    mrn: "MRN-456789",
    age: 61,
    gender: "Female",
    bloodType: "AB+",
    admissionDate: "2024-01-12",
    medicalHistory: ["Hypertension", "Osteoporosis"],
    medications: ["Amlodipine", "Alendronate"],
    allergies: ["Latex"],
    lastVisit: "2024-01-12",
    totalVisits: 1,
  },
]

export default function PatientRecordsPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    const storedEmail = sessionStorage.getItem("userEmail")
    if (!storedRole || storedRole !== "doctor") {
      router.push("/login")
    } else {
      setUserEmail(storedEmail || "")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Patient Records</h1>
            <p className="text-muted-foreground">Access comprehensive patient histories • Logged in as: {userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/doctor">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-muted-foreground">Total Patients</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">11</div>
                  <div className="text-sm text-muted-foreground">Total Visits</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Active Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">2</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {PATIENT_RECORDS.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{record.patientName}</CardTitle>
                      <Badge variant="outline">{record.gender}</Badge>
                      <Badge variant="secondary">{record.bloodType}</Badge>
                    </div>
                    <CardDescription>
                      MRN: {record.mrn} • Age: {record.age} years • {record.totalVisits} visits
                    </CardDescription>
                  </div>
                  <Button size="sm">View Full Record</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Medical History</div>
                      <div className="flex flex-wrap gap-2">
                        {record.medicalHistory.map((condition, idx) => (
                          <Badge key={idx} variant="outline">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Current Medications</div>
                      <div className="flex flex-wrap gap-2">
                        {record.medications.map((med, idx) => (
                          <Badge key={idx} variant="secondary">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Allergies</div>
                      <div className="flex flex-wrap gap-2">
                        {record.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive" className="bg-red-100 text-red-800">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Admission Date</div>
                        <div className="font-medium">{record.admissionDate}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Last Visit</div>
                        <div className="font-medium">{record.lastVisit}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

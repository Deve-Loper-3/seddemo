"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Users, MessageSquare, AlertCircle } from "lucide-react"

const CASE_REVIEWS = [
  {
    id: "CASE-2024-012",
    patientId: "PT-8821",
    scanId: "MRI-2024-001",
    title: "Complex bilateral watershed infarction",
    description:
      "Patient presents with unusual bilateral watershed pattern. AI confidence high but seeking second opinion on extent.",
    requestedBy: "Dr. Sarah Chen",
    status: "open",
    priority: "high",
    comments: 3,
    dateRequested: "2024-01-15",
  },
  {
    id: "CASE-2024-011",
    patientId: "PT-8819",
    scanId: "MRI-2023-998",
    title: "Differentiation between acute and subacute",
    description:
      "DWI shows restricted diffusion but FLAIR signal suggests subacute timing. Need consensus on classification.",
    requestedBy: "Dr. Michael Torres",
    status: "in-review",
    priority: "medium",
    comments: 7,
    dateRequested: "2024-01-14",
  },
  {
    id: "CASE-2024-010",
    patientId: "PT-8817",
    scanId: "MRI-2023-995",
    title: "Small cortical infarct vs artifact",
    description: "Subtle signal abnormality in right parietal cortex. AI flagged as infarct but could be artifact.",
    requestedBy: "Dr. James Wilson",
    status: "resolved",
    priority: "low",
    comments: 5,
    dateRequested: "2024-01-13",
    dateResolved: "2024-01-14",
  },
  {
    id: "CASE-2024-009",
    patientId: "PT-8815",
    scanId: "MRI-2023-992",
    title: "Hemorrhagic transformation assessment",
    description:
      "Follow-up scan showing possible hemorrhagic transformation. Need expert review for treatment planning.",
    requestedBy: "Dr. Sarah Chen",
    status: "resolved",
    priority: "high",
    comments: 9,
    dateRequested: "2024-01-12",
    dateResolved: "2024-01-13",
  },
]

export default function CaseReviewsPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "radiologist") {
      router.push("/login")
    }
  }, [router])

  const openCases = CASE_REVIEWS.filter((c) => c.status === "open").length
  const inReview = CASE_REVIEWS.filter((c) => c.status === "in-review").length
  const resolved = CASE_REVIEWS.filter((c) => c.status === "resolved").length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/radiologist">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Case Reviews</h1>
        </div>
        <p className="text-muted-foreground mb-8">Collaborate on complex cases</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{openCases}</div>
                  <div className="text-sm text-muted-foreground">Open Cases</div>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{inReview}</div>
                  <div className="text-sm text-muted-foreground">In Review</div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{resolved}</div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Reviews List */}
        <div className="space-y-4">
          {CASE_REVIEWS.map((caseReview) => (
            <Card key={caseReview.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{caseReview.title}</CardTitle>
                      {caseReview.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          High Priority
                        </Badge>
                      )}
                      {caseReview.priority === "medium" && (
                        <Badge variant="secondary" className="text-xs">
                          Medium
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {caseReview.id} • Patient: {caseReview.patientId} • Scan: {caseReview.scanId}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      caseReview.status === "resolved"
                        ? "default"
                        : caseReview.status === "in-review"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {caseReview.status === "open"
                      ? "Open"
                      : caseReview.status === "in-review"
                        ? "In Review"
                        : "Resolved"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{caseReview.description}</p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Requested By</div>
                    <div className="text-sm text-muted-foreground">{caseReview.requestedBy}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Date Requested</div>
                    <div className="text-sm text-muted-foreground">{caseReview.dateRequested}</div>
                  </div>
                  {caseReview.dateResolved && (
                    <div>
                      <div className="text-sm font-medium mb-1">Date Resolved</div>
                      <div className="text-sm text-muted-foreground">{caseReview.dateResolved}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium mb-1">Comments</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {caseReview.comments} comments
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Case Details
                  </Button>
                  {caseReview.status !== "resolved" && (
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, FileText, Download, Eye, Plus } from "lucide-react"

const REPORTS = [
  {
    id: "RPT-2024-001",
    title: "AI Model Performance Analysis Q1 2024",
    description: "Comprehensive evaluation of stroke detection accuracy across all classifications",
    author: "Dr. Emily Rodriguez",
    date: "2024-01-15",
    status: "published",
    pages: 24,
    downloads: 47,
  },
  {
    id: "RPT-2023-012",
    title: "Age and Gender Distribution in Stroke Patients",
    description: "Statistical analysis of demographic factors in the study cohort",
    author: "Dr. Michael Chen",
    date: "2023-12-20",
    status: "published",
    pages: 18,
    downloads: 63,
  },
  {
    id: "RPT-2024-002",
    title: "Correlation Between NIHSS Scores and Lesion Volume",
    description: "Examining the relationship between stroke severity and MRI findings",
    author: "Dr. Sarah Thompson",
    date: "2024-01-10",
    status: "draft",
    pages: 15,
    downloads: 0,
  },
  {
    id: "RPT-2023-011",
    title: "Multi-Center Study Results: 6-Month Analysis",
    description: "Interim findings from all participating institutions",
    author: "Dr. James Wilson",
    date: "2023-12-05",
    status: "published",
    pages: 32,
    downloads: 89,
  },
]

export default function ResearchReportsPage() {
  const router = useRouter()

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "analyst") {
      router.push("/login")
    }
  }, [router])

  const publishedReports = REPORTS.filter((r) => r.status === "published").length
  const draftReports = REPORTS.filter((r) => r.status === "draft").length
  const totalDownloads = REPORTS.reduce((acc, r) => acc + r.downloads, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/analyst">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Research Reports</h1>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">Generate study findings and reports</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{publishedReports}</div>
              <div className="text-sm text-muted-foreground">Published Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{draftReports}</div>
              <div className="text-sm text-muted-foreground">Draft Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{totalDownloads}</div>
              <div className="text-sm text-muted-foreground">Total Downloads</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {REPORTS.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge variant={report.status === "published" ? "default" : "secondary"}>
                        {report.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {report.id} • {report.date}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Author</div>
                    <div className="text-sm text-muted-foreground">{report.author}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Pages</div>
                    <div className="text-sm text-muted-foreground">{report.pages} pages</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Downloads</div>
                    <div className="text-sm text-muted-foreground">{report.downloads} downloads</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  {report.status === "published" && (
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
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

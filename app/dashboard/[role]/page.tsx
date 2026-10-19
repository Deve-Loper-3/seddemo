"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Brain,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Stethoscope,
  ScanLine,
  Database,
  TrendingUp,
  Shield,
  CheckCircle,
  Edit3,
  GitCompare,
  LineChart,
} from "lucide-react"

const ROLE_CONFIG = {
  doctor: {
    title: "Expert Validation Dashboard",
    icon: Stethoscope,
    description:
      "This dashboard enables expert reviewers to evaluate and validate AI-generated stroke predictions as part of the ongoing research study.",
    welcomeTitle: "Welcome to the Stroke AI Research Platform — Expert Validation Dashboard",
    features: [
      {
        icon: CheckCircle,
        title: "AI Predictions Review",
        description:
          "Review AI-generated classifications of ischemic, hemorrhagic, or normal scans with confidence scores and lesion heatmaps. Mark predictions as correct, incorrect, or uncertain.",
        slug: "ai-predictions-review",
      },
      {
        icon: Edit3,
        title: "Annotate and Correct",
        description:
          "Access MRI scans to edit or draw lesion boundaries, correct AI annotations using overlays from U-Net or nnU-Net, and submit adjustments to support model retraining.",
        slug: "annotate-correct",
      },
      {
        icon: GitCompare,
        title: "Model Comparison",
        description:
          "Compare predictions across ResNet50, EfficientNet, and DenseNet models for the same MRI scan, showing probability scores, overlap metrics, and localization accuracy.",
        slug: "model-comparison",
      },
      {
        icon: LineChart,
        title: "Performance Insights",
        description:
          "Display aggregated model performance metrics such as accuracy, sensitivity, specificity, and false-positive/false-negative distributions across datasets, age groups, or scan modalities.",
        slug: "performance-insights",
      },
    ],
    stats: [
      { value: "1,247", label: "Cases Reviewed" },
      { value: "94.2%", label: "Model Accuracy" },
      { value: "856", label: "Feedback Submitted" },
      { value: "8", label: "Datasets Involved" },
    ],
  },
  radiologist: {
    title: "Radiologist Dashboard",
    icon: ScanLine,
    description: "Analyze MRI scans and validate AI predictions",
    features: [
      { icon: Brain, title: "MRI Analysis", description: "Review and annotate MRI scan images", slug: "mri-analysis" },
      {
        icon: FileText,
        title: "AI Predictions",
        description: "Validate AI-generated stroke detections",
        slug: "ai-predictions",
      },
      {
        icon: BarChart3,
        title: "Accuracy Metrics",
        description: "Monitor AI system performance",
        slug: "accuracy-metrics",
      },
      { icon: Users, title: "Case Reviews", description: "Collaborate on complex cases", slug: "case-reviews" },
    ],
    stats: [
      { value: "1,247", label: "Total Cases" },
      { value: "94.2%", label: "AI Accuracy" },
      { value: "23", label: "Active Users" },
      { value: "8", label: "Institutions" },
    ],
  },
  "data-entry": {
    title: "Data Entry Dashboard",
    icon: Database,
    description: "Input and manage patient data and scan metadata",
    features: [
      {
        icon: FileText,
        title: "Data Entry Forms",
        description: "Input patient information and scan data",
        slug: "data-entry-forms",
      },
      {
        icon: Database,
        title: "Database Management",
        description: "Organize and update records",
        slug: "database-management",
      },
      { icon: Brain, title: "Scan Upload", description: "Upload MRI images to the system", slug: "scan-upload" },
      {
        icon: BarChart3,
        title: "Entry Statistics",
        description: "Track data entry progress",
        slug: "entry-statistics",
      },
    ],
    stats: [
      { value: "1,247", label: "Total Cases" },
      { value: "94.2%", label: "AI Accuracy" },
      { value: "23", label: "Active Users" },
      { value: "8", label: "Institutions" },
    ],
  },
  analyst: {
    title: "Analyst Dashboard",
    icon: TrendingUp,
    description: "Analyze research data and generate insights",
    features: [
      {
        icon: BarChart3,
        title: "Statistical Analysis",
        description: "Perform data analysis and modeling",
        slug: "statistical-analysis",
      },
      {
        icon: Brain,
        title: "AI Performance",
        description: "Evaluate model accuracy and metrics",
        slug: "ai-performance",
      },
      {
        icon: FileText,
        title: "Research Reports",
        description: "Generate study findings and reports",
        slug: "research-reports",
      },
      {
        icon: TrendingUp,
        title: "Trend Analysis",
        description: "Identify patterns in stroke data",
        slug: "trend-analysis",
      },
    ],
    stats: [
      { value: "1,247", label: "Total Cases" },
      { value: "94.2%", label: "AI Accuracy" },
      { value: "23", label: "Active Users" },
      { value: "8", label: "Institutions" },
    ],
  },
  admin: {
    title: "Administrator Dashboard",
    icon: Shield,
    description: "Manage system settings and user access",
    features: [
      {
        icon: Users,
        title: "User Management",
        description: "Add, edit, and manage user accounts",
        slug: "user-management",
      },
      { icon: Settings, title: "System Settings", description: "Configure system parameters", slug: "system-settings" },
      {
        icon: Shield,
        title: "Security & Access",
        description: "Manage permissions and security",
        slug: "security-access",
      },
      {
        icon: BarChart3,
        title: "System Analytics",
        description: "Monitor overall system usage",
        slug: "system-analytics",
      },
    ],
    stats: [
      { value: "1,247", label: "Total Cases" },
      { value: "94.2%", label: "AI Accuracy" },
      { value: "23", label: "Active Users" },
      { value: "8", label: "Institutions" },
    ],
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const params = useParams()
  const role = params.role as string
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    const storedEmail = sessionStorage.getItem("userEmail")

    if (!storedRole || storedRole !== role) {
      router.push("/login")
    } else {
      setUserEmail(storedEmail || "")
    }
  }, [role, router])

  const handleLogout = () => {
    sessionStorage.removeItem("userRole")
    sessionStorage.removeItem("userEmail")
    router.push("/login")
  }

  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]

  if (!config) {
    return null
  }

  const IconComponent = config.icon

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <IconComponent className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{config.title}</h1>
            </div>
            <p className="text-muted-foreground">{config.description}</p>
            <p className="text-sm text-muted-foreground mt-1">Logged in as: {userEmail}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Brain className="h-12 w-12 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {config.welcomeTitle || "Welcome to the Stroke AI Research Platform"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {role === "doctor"
                    ? config.description
                    : "This is your role-specific dashboard for the Computer-aided Detection and Classification of Ischemic Strokes study. Access your tools and resources below."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {config.features.map((feature, index) => {
            const FeatureIcon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FeatureIcon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/${role}/${feature.slug}`}>Access {feature.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          {config.stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

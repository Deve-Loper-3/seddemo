import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle,
  ClipboardList,
  Database,
  Edit3,
  FileText,
  GitCompare,
  HeartPulse,
  LineChart,
  MessagesSquare,
  ScanLine,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "./types"

export type Feature = { slug: string; title: string; description: string; icon: LucideIcon; short?: string }

export const ROLE_CONFIG: Record<Role, { title: string; icon: LucideIcon; description: string; features: Feature[] }> = {
  doctor: {
    title: "Expert Validation Dashboard",
    icon: Stethoscope,
    description:
      "Evaluate and validate AI-generated stroke predictions that radiologists have already reviewed, as the final step of the study's adjudication workflow.",
    features: [
      {
        slug: "ai-predictions-review",
        short: "AI Review",
        title: "AI Predictions Review",
        icon: CheckCircle,
        description:
          "Review AI classifications (ischemic stroke vs. no acute stroke) with confidence scores and lesion heatmaps. Mark each as correct, incorrect, or uncertain.",
      },
      {
        slug: "annotate-correct",
        short: "Annotate",
        title: "Annotate and Correct",
        icon: Edit3,
        description:
          "Draw or correct lesion boundaries over U-Net / nnU-Net overlays and submit adjustments to the retraining queue.",
      },
      {
        slug: "model-comparison",
        short: "Models",
        title: "Model Comparison",
        icon: GitCompare,
        description: "Compare ResNet50, EfficientNet-B4 and DenseNet121 on the same scan: probabilities, agreement and segmentation overlap.",
      },
      {
        slug: "performance-insights",
        short: "Performance",
        title: "Performance Insights",
        icon: LineChart,
        description: "Accuracy, sensitivity, specificity and error distribution across sites, age groups and MRI sequences.",
      },
      {
        slug: "patient-records",
        short: "Patients",
        title: "Patient Records",
        icon: ClipboardList,
        description: "Look up clinical details, scans and review history for every enrolled patient.",
      },
      {
        slug: "treatment-outcomes",
        short: "Outcomes",
        title: "Treatment Outcomes",
        icon: HeartPulse,
        description: "NIHSS change and 90-day mRS by treatment pathway; record outcomes for discharged patients.",
      },
    ],
  },
  radiologist: {
    title: "Radiologist Dashboard",
    icon: ScanLine,
    description: "Read MRI studies, verify AI detections, and discuss difficult cases.",
    features: [
      { slug: "ai-predictions", title: "AI Predictions", icon: FileText, description: "Accept or reject AI stroke detections in your reading queue." },
      { slug: "mri-analysis", title: "MRI Analysis", icon: Brain, description: "Open any study in the viewer, adjust window/level and annotate lesions." },
      { slug: "case-reviews", title: "Case Reviews", icon: MessagesSquare, description: "Open, discuss and resolve complex cases with colleagues." },
      { slug: "accuracy-metrics", title: "Accuracy Metrics", icon: BarChart3, description: "Live AI performance against radiologist reads." },
    ],
  },
  "data-entry": {
    title: "Data Entry Dashboard",
    icon: Database,
    description: "Register patients, upload MRI studies, and keep study records complete.",
    features: [
      { slug: "data-entry-forms", title: "Data Entry Forms", icon: FileText, description: "Register a new patient with clinical presentation data." },
      { slug: "scan-upload", title: "Scan Upload", icon: Upload, description: "Upload MRI images for a patient and send them to the AI pipeline." },
      { slug: "database-management", title: "Database Management", icon: Database, description: "Search, edit, delete and export patient records." },
      { slug: "entry-statistics", title: "Entry Statistics", icon: BarChart3, description: "Track data entry throughput and record completeness." },
    ],
  },
  analyst: {
    title: "Analyst Dashboard",
    icon: TrendingUp,
    description: "Analyse cohort data and AI performance, and produce study reports.",
    features: [
      { slug: "statistical-analysis", title: "Statistical Analysis", icon: BarChart3, description: "Cohort demographics, risk factors and severity distributions." },
      { slug: "ai-performance", title: "AI Performance", icon: Brain, description: "Confusion matrix, ROC curves and model-version comparison." },
      { slug: "trend-analysis", title: "Trend Analysis", icon: TrendingUp, description: "Monthly enrolment, positivity rate and turnaround times." },
      { slug: "research-reports", title: "Research Reports", icon: FileText, description: "Generate, edit, publish and download study reports." },
    ],
  },
  admin: {
    title: "Administrator Dashboard",
    icon: Shield,
    description: "Manage accounts, permissions and platform configuration.",
    features: [
      { slug: "user-management", title: "User Management", icon: Users, description: "Create, edit, suspend and delete user accounts." },
      { slug: "security-access", title: "Security & Access", icon: Shield, description: "Role permission matrix and the full audit log." },
      { slug: "system-settings", title: "System Settings", icon: Settings, description: "AI thresholds, workflow rules and maintenance mode." },
      { slug: "system-analytics", title: "System Analytics", icon: Activity, description: "Platform usage, pipeline health and contact inquiries." },
    ],
  },
}

export function isRole(x: string): x is Role {
  return x in ROLE_CONFIG
}

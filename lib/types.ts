export type Role = "doctor" | "radiologist" | "data-entry" | "analyst" | "admin"

export const ROLE_LABELS: Record<Role, string> = {
  doctor: "Expert Reviewer (Doctor)",
  radiologist: "Radiologist",
  "data-entry": "Data Entry",
  analyst: "Analyst",
  admin: "Administrator",
}

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  site: string
  status: "active" | "suspended"
  createdAt: string
  lastLogin?: string
}

export type Sex = "Male" | "Female"

export type StrokeLabel = "Ischemic stroke" | "No acute stroke"

export type IschemicSubtype = "Large vessel occlusion" | "Cardioembolic" | "Lacunar (small vessel)" | "Watershed"

export type Treatment = "IV thrombolysis (tPA)" | "Mechanical thrombectomy" | "tPA + thrombectomy" | "Antiplatelet / supportive"

export type Patient = {
  id: string
  name: string
  age: number
  sex: Sex
  site: string
  admittedAt: string
  symptomOnsetHours: number
  nihssAdmission: number
  comorbidities: string[]
  presentingSymptoms: string
  status: "Admitted" | "Discharged" | "Follow-up" | "Deceased"
  treatment?: Treatment
  nihssDischarge?: number
  mrs90?: number
  lengthOfStayDays?: number
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type Sequence = "DWI" | "ADC" | "FLAIR" | "T2" | "T1" | "MRA"

export type ModelName = "ResNet50" | "EfficientNet-B4" | "DenseNet121"
export const MODELS: ModelName[] = ["ResNet50", "EfficientNet-B4", "DenseNet121"]

export type Lesion = { x: number; y: number; r: number } // normalized 0..1 to image

export type AIPrediction = {
  label: StrokeLabel
  subtype?: IschemicSubtype
  confidence: number // 0..1, probability of predicted label
  region: string
  volumeMl: number
  lesion?: Lesion
  modelProbs: Record<ModelName, number> // probability of ischemic stroke per model
  segmentationDice: { "U-Net": number; "nnU-Net": number }
  modelVersion: string
  createdAt: string
}

export type Verdict = "correct" | "incorrect" | "uncertain"

export type Review = {
  verdict: Verdict
  finalLabel: StrokeLabel
  notes: string
  reviewer: string
  at: string
}

export type ScanStatus = "processing" | "pending-radiologist" | "pending-validation" | "validated"

export type Scan = {
  id: string
  patientId: string
  sequence: Sequence
  image: string // url or data url
  fileName: string
  fileSizeMb: number
  slices: number
  uploadedBy: string
  uploadedAt: string
  status: ScanStatus
  ai?: AIPrediction
  radiologistReview?: Review
  expertValidation?: Review
}

export type Point = [number, number]
export type Stroke = { points: Point[]; color: string; width: number; erase?: boolean }

export type Annotation = {
  id: string
  scanId: string
  author: string
  authorRole: Role
  strokes: Stroke[]
  baseOverlay?: "U-Net" | "nnU-Net" | "none"
  note: string
  forRetraining: boolean
  createdAt: string
}

export type CaseComment = { id: string; author: string; text: string; at: string }

export type CaseDiscussion = {
  id: string
  scanId: string
  title: string
  priority: "Routine" | "Urgent" | "Critical"
  status: "open" | "resolved"
  createdBy: string
  createdAt: string
  comments: CaseComment[]
}

export type Report = {
  id: string
  title: string
  kind: "Interim analysis" | "AI performance" | "Cohort summary" | "Site comparison"
  author: string
  status: "draft" | "published"
  createdAt: string
  content: string // markdown
}

export type AuditEntry = {
  id: string
  at: string
  user: string
  action: string
  detail: string
  severity: "info" | "warning" | "critical"
}

export type Inquiry = {
  id: string
  name: string
  email: string
  institution: string
  message: string
  at: string
  read: boolean
}

export type Permission =
  | "view_patients"
  | "edit_patients"
  | "upload_scans"
  | "review_ai"
  | "validate_cases"
  | "annotate"
  | "view_analytics"
  | "export_data"
  | "manage_users"
  | "manage_settings"

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_patients: "View patient records",
  edit_patients: "Create / edit patients",
  upload_scans: "Upload MRI scans",
  review_ai: "Review AI predictions",
  validate_cases: "Final expert validation",
  annotate: "Annotate lesions",
  view_analytics: "View analytics",
  export_data: "Export de-identified data",
  manage_users: "Manage users",
  manage_settings: "Manage system settings",
}

export type Settings = {
  studyName: string
  aiConfidenceThreshold: number // below this predictions flagged
  activeModelVersion: string
  autoRunAI: boolean
  requireDoubleReview: boolean
  sessionTimeoutMin: number
  maxUploadMb: number
  maintenanceMode: boolean
  emailNotifications: boolean
}

export type DB = {
  version: number
  users: User[]
  patients: Patient[]
  scans: Scan[]
  annotations: Annotation[]
  cases: CaseDiscussion[]
  reports: Report[]
  audit: AuditEntry[]
  inquiries: Inquiry[]
  permissions: Record<Role, Permission[]>
  settings: Settings
  sites: string[]
}

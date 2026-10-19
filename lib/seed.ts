import { ACTIVE_MODEL_VERSION, between, mulberry32, pick, round, simulatePrediction } from "./ai"
import { SAMPLE_IMAGES } from "./images"
import type {
  AuditEntry,
  CaseDiscussion,
  DB,
  Inquiry,
  Patient,
  Permission,
  Report,
  Role,
  Scan,
  StrokeLabel,
  Treatment,
  User,
} from "./types"

export const DB_VERSION = 4

export const SITES = [
  "Site 01 – Lagos, Nigeria",
  "Site 02 – Nairobi, Kenya",
  "Site 03 – Kampala, Uganda",
  "Site 04 – Accra, Ghana",
  "Site 05 – Dhaka, Bangladesh",
  "Site 06 – Lahore, Pakistan",
  "Site 07 – Pune, India",
  "Site 08 – Recife, Brazil",
]

export const DEMO_ACCOUNTS: { email: string; password: string; role: Role; name: string }[] = [
  { email: "doctor@example.com", password: "doctor123", role: "doctor", name: "Dr. Amara Okafor" },
  { email: "radiologist@example.com", password: "radio123", role: "radiologist", name: "Dr. Rohan Mehta" },
  { email: "dataentry@example.com", password: "data123", role: "data-entry", name: "Grace Wanjiru" },
  { email: "analyst@example.com", password: "analyst123", role: "analyst", name: "Dr. Lucas Ferreira" },
  { email: "admin@example.com", password: "admin123", role: "admin", name: "Fatima Rahman" },
]

const EXTRA_USERS: [string, Role, number][] = [
  ["Dr. Kwame Mensah", "doctor", 3],
  ["Dr. Ayesha Siddiqui", "radiologist", 5],
  ["Dr. Daniel Ssempala", "radiologist", 2],
  ["Joseph Otieno", "data-entry", 1],
  ["Priya Nair", "data-entry", 6],
  ["Chinedu Eze", "data-entry", 0],
  ["Dr. Beatriz Souza", "doctor", 7],
  ["Dr. Imran Qureshi", "analyst", 5],
  ["Nadia Akter", "data-entry", 4],
  ["Dr. Esi Boateng", "radiologist", 3],
]

const FIRST_M = ["Emeka", "Samuel", "Rahul", "Tariq", "Kofi", "Moses", "Arjun", "João", "Bilal", "Peter", "Hassan", "Yusuf", "Ravi", "Paulo", "Ibrahim", "David", "Anil", "Musa"]
const FIRST_F = ["Ngozi", "Mercy", "Sunita", "Farida", "Abena", "Esther", "Kavya", "Ana", "Saima", "Ruth", "Halima", "Joyce", "Lakshmi", "Mariana", "Rukhsana", "Agnes", "Deepa", "Zainab"]
const LAST = ["Adeyemi", "Kamau", "Sharma", "Hussain", "Asante", "Mugisha", "Patel", "Silva", "Chowdhury", "Okello", "Bello", "Mwangi", "Iyer", "Costa", "Malik", "Nakato", "Rao", "Owusu", "Islam", "Ochieng"]
const COMORBIDITIES = ["Hypertension", "Diabetes mellitus", "Atrial fibrillation", "Dyslipidemia", "Smoking", "Prior stroke/TIA", "Sickle cell disease", "HIV"]
const SYMPTOMS = [
  "Right-sided weakness and expressive aphasia",
  "Left facial droop and left arm weakness",
  "Sudden dysarthria and right hemiparesis",
  "Left hemineglect and gaze deviation",
  "Acute vertigo, ataxia and vomiting",
  "Transient confusion and word-finding difficulty",
  "Right leg weakness (lower > upper limb)",
  "Sudden severe headache with dizziness",
]
const TREATMENTS: Treatment[] = ["IV thrombolysis (tPA)", "Mechanical thrombectomy", "tPA + thrombectomy", "Antiplatelet / supportive"]

const DAY = 86_400_000

export const DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  doctor: ["view_patients", "review_ai", "validate_cases", "annotate", "view_analytics"],
  radiologist: ["view_patients", "review_ai", "annotate", "view_analytics"],
  "data-entry": ["view_patients", "edit_patients", "upload_scans", "export_data"],
  analyst: ["view_analytics", "export_data"],
  admin: [
    "view_patients",
    "edit_patients",
    "upload_scans",
    "view_analytics",
    "export_data",
    "manage_users",
    "manage_settings",
  ],
}

export function buildSeed(now = Date.now()): DB {
  const rng = mulberry32(20240115)
  const iso = (t: number) => new Date(t).toISOString()
  const ago = (days: number, jitterHours = 0) => now - days * DAY - Math.floor(rng() * jitterHours * 3_600_000)

  // ---------- users ----------
  const users: User[] = DEMO_ACCOUNTS.map((a, i) => ({
    id: `U-${100 + i}`,
    name: a.name,
    email: a.email,
    password: a.password,
    role: a.role,
    site: SITES[i % SITES.length],
    status: "active",
    createdAt: iso(ago(320 - i * 3)),
    lastLogin: iso(ago(1 + i, 20)),
  }))
  EXTRA_USERS.forEach(([name, role, site], i) => {
    const handle = name.replace(/^Dr\. /, "").toLowerCase().replace(/[^a-z]+/g, ".")
    users.push({
      id: `U-${110 + i}`,
      name,
      email: `${handle}@strokeai-study.org`,
      password: "demo1234",
      role,
      site: SITES[site],
      status: i === 5 ? "suspended" : "active",
      createdAt: iso(ago(300 - i * 17)),
      lastLogin: iso(ago(Math.floor(rng() * 20), 20)),
    })
  })

  const dataEntryNames = users.filter((u) => u.role === "data-entry").map((u) => u.name)
  const radiologists = users.filter((u) => u.role === "radiologist").map((u) => u.name)
  const doctors = users.filter((u) => u.role === "doctor").map((u) => u.name)

  // ---------- patients & scans ----------
  const ischemicSets = [
    { images: ["/images/mri/dwi-aca-infarct.jpg", "/images/mri/adc-aca-infarct.jpg", "/images/mri/mra-tof.jpg"] },
    { images: ["/images/mri/dwi-mca-infarct.jpg"] },
    { images: ["/images/mri/dwi-basal-ganglia-infarct.jpg"] },
  ]
  const normalImages = SAMPLE_IMAGES.filter((s) => s.finding === "normal").map((s) => s.src)

  const patients: Patient[] = []
  const scans: Scan[] = []
  const N = 42
  let scanSeq = 2001

  for (let i = 0; i < N; i++) {
    const sex = rng() < 0.52 ? "Male" : "Female"
    const name = `${pick(rng, sex === "Male" ? FIRST_M : FIRST_F)} ${pick(rng, LAST)}`
    // spread admissions over ~11 months, denser recently
    const daysAgo = Math.floor(Math.pow(rng(), 1.8) * 330) + 1
    const admitted = ago(daysAgo, 18)
    const ischemic = rng() < 0.78
    const nihss = ischemic ? Math.floor(between(rng, 2, 24)) : Math.floor(between(rng, 0, 5))
    const comorb = COMORBIDITIES.filter(() => rng() < 0.28)
    if (ischemic && comorb.length === 0) comorb.push("Hypertension")
    const site = SITES[Math.floor(rng() * SITES.length)]
    const id = `PT-${1001 + i}`
    const creator = pick(rng, dataEntryNames)

    let status: Patient["status"] = "Admitted"
    let treatment: Treatment | undefined
    let nihssDischarge: number | undefined
    let mrs90: number | undefined
    let los: number | undefined
    if (daysAgo > 10) {
      treatment = ischemic ? pick(rng, TREATMENTS) : "Antiplatelet / supportive"
      const benefit = treatment === "tPA + thrombectomy" ? 0.55 : treatment === "Mechanical thrombectomy" ? 0.5 : treatment === "IV thrombolysis (tPA)" ? 0.4 : 0.2
      nihssDischarge = Math.max(0, Math.round(nihss * (1 - benefit) + between(rng, -2, 3)))
      los = Math.round(between(rng, 3, 18))
      status = "Discharged"
      if (daysAgo > 90) {
        mrs90 = Math.min(6, Math.max(0, Math.round(nihssDischarge / 4 + between(rng, -1, 1.5))))
        status = mrs90 === 6 ? "Deceased" : "Follow-up"
      }
    }

    patients.push({
      id,
      name,
      age: Math.floor(between(rng, ischemic ? 42 : 30, 86)),
      sex,
      site,
      admittedAt: iso(admitted),
      symptomOnsetHours: round(between(rng, 0.8, 22), 1),
      nihssAdmission: nihss,
      comorbidities: comorb,
      presentingSymptoms: pick(rng, SYMPTOMS),
      status,
      treatment,
      nihssDischarge,
      mrs90,
      lengthOfStayDays: los,
      notes: ischemic ? "" : "Stroke mimic suspected; MRI ordered to exclude infarct.",
      createdBy: creator,
      createdAt: iso(admitted + 2 * 3_600_000),
      updatedAt: iso(admitted + 3 * 3_600_000),
    })

    // scans for this patient
    const images = ischemic ? pick(rng, ischemicSets).images.slice(0, rng() < 0.6 ? 1 : 2) : [pick(rng, normalImages)]
    images.forEach((img, k) => {
      const sample = SAMPLE_IMAGES.find((s) => s.src === img)!
      const uploadedAt = admitted + (4 + k) * 3_600_000
      const truth: StrokeLabel = sample.finding === "normal" ? "No acute stroke" : "Ischemic stroke"
      const ai = simulatePrediction({ image: img, sequence: sample.sequence, rng, at: iso(uploadedAt + 600_000), modelVersion: daysAgo > 200 ? "StrokeNet v2.1" : daysAgo > 90 ? "StrokeNet v2.2" : ACTIVE_MODEL_VERSION })
      const scan: Scan = {
        id: `MRI-${scanSeq++}`,
        patientId: id,
        sequence: sample.sequence,
        image: img,
        fileName: `${id}_${sample.sequence}_${new Date(uploadedAt).toISOString().slice(0, 10).replace(/-/g, "")}.dcm`,
        fileSizeMb: round(between(rng, 12, 34), 1),
        slices: Math.floor(between(rng, 20, 36)),
        uploadedBy: creator,
        uploadedAt: iso(uploadedAt),
        status: "pending-radiologist",
        ai,
      }
      const verdictFor = (): "correct" | "incorrect" | "uncertain" =>
        rng() < 0.05 ? "uncertain" : ai.label === truth ? "correct" : "incorrect"
      // every scan gets both reviews; recent ones are stripped back below by recency rank
      const capped = (t: number) => iso(Math.min(t, now - 600_000))
      scan.radiologistReview = {
        verdict: verdictFor(),
        finalLabel: truth,
        notes: ai.label === truth ? "Agree with AI read." : "AI result not supported by imaging; corrected.",
        reviewer: pick(rng, radiologists),
        at: capped(uploadedAt + between(rng, 2, 20) * 3_600_000),
      }
      scan.expertValidation = {
        verdict: verdictFor(),
        finalLabel: truth,
        notes: "",
        reviewer: pick(rng, doctors),
        at: capped(uploadedAt + between(rng, 24, 72) * 3_600_000),
      }
      scan.status = "validated"
      scans.push(scan)
    })
  }

  // Pipeline state by recency so every role's queue has work in it:
  // newest → AI processing, next 8 → radiologist queue, next 7 → expert validation queue.
  const byRecency = [...scans].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  byRecency.forEach((s, rank) => {
    if (rank === 0) {
      s.status = "processing"
      s.ai = undefined
    }
    if (rank <= 8) s.radiologistReview = undefined
    if (rank <= 15) s.expertValidation = undefined
    if (rank >= 1 && rank <= 8) s.status = "pending-radiologist"
    if (rank >= 9 && rank <= 15) s.status = "pending-validation"
  })

  // ---------- case discussions ----------
  const discussScans = scans.filter((s) => s.status !== "processing").slice(-12)
  const cases: CaseDiscussion[] = [
    {
      title: "Possible posterior circulation involvement – second opinion",
      priority: "Urgent" as const,
      status: "open" as const,
      comments: [
        "DWI hyperintensity is subtle; ADC confirms restriction. Please review posterior fossa slices.",
        "Agree – small focus in left cerebellar hemisphere, consistent with acute infarct.",
      ],
    },
    {
      title: "AI false positive on normal T2 – artifact?",
      priority: "Routine" as const,
      status: "open" as const,
      comments: ["Model flagged right frontal region. I think this is susceptibility artifact near the sinus."],
    },
    {
      title: "Large ACA territory infarct – thrombectomy candidacy",
      priority: "Critical" as const,
      status: "resolved" as const,
      comments: [
        "Lesion volume ~45 mL, onset 3.5 h. TOF-MRA shows left A2 cut-off.",
        "Discussed with neuro-intervention; proceeded with thrombectomy. Closing.",
      ],
    },
    {
      title: "Lacunar vs. early cardioembolic pattern",
      priority: "Routine" as const,
      status: "open" as const,
      comments: ["AI subtype says lacunar but patient has AF. Would value input before validation."],
    },
  ].map((c, i) => {
    const scan = discussScans[i * 3] ?? scans[i]
    const t0 = new Date(scan.uploadedAt).getTime() + 5 * 3_600_000
    return {
      id: `CR-${301 + i}`,
      scanId: scan.id,
      title: c.title,
      priority: c.priority,
      status: c.status,
      createdBy: radiologists[i % radiologists.length],
      createdAt: iso(t0),
      comments: c.comments.map((text, k) => ({
        id: `CM-${i}-${k}`,
        author: k % 2 === 0 ? radiologists[i % radiologists.length] : doctors[i % doctors.length],
        text,
        at: iso(t0 + (k + 1) * 2 * 3_600_000),
      })),
    }
  })

  // ---------- reports ----------
  const reports: Report[] = [
    {
      id: "RPT-501",
      title: "Q2 Interim Analysis – Detection Accuracy",
      kind: "Interim analysis",
      author: "Dr. Lucas Ferreira",
      status: "published",
      createdAt: iso(ago(120)),
      content:
        "# Q2 Interim Analysis\n\nThe ensemble model achieved 91% accuracy on radiologist-adjudicated cases.\n\n- Sensitivity remained above 90% for DWI studies.\n- False positives clustered on T1/T2 sequences without diffusion imaging.\n\n**Recommendation:** restrict primary triage to DWI/ADC where available.",
    },
    {
      id: "RPT-502",
      title: "Site Comparison – Data Completeness",
      kind: "Site comparison",
      author: "Dr. Imran Qureshi",
      status: "published",
      createdAt: iso(ago(60)),
      content:
        "# Site Comparison\n\nAll eight sites are enrolling. Sites 02 and 07 report the highest completeness of 90-day mRS follow-up.\n\nSites 04 and 08 need support for follow-up calls.",
    },
    {
      id: "RPT-503",
      title: "Cohort Summary – Draft",
      kind: "Cohort summary",
      author: "Dr. Lucas Ferreira",
      status: "draft",
      createdAt: iso(ago(5)),
      content: "# Cohort Summary (draft)\n\nTo be regenerated after the current validation batch is complete.",
    },
  ]

  // ---------- audit log ----------
  const auditActions: [string, string, AuditEntry["severity"]][] = [
    ["login", "Signed in", "info"],
    ["upload_scan", "Uploaded MRI scan", "info"],
    ["review_ai", "Reviewed AI prediction", "info"],
    ["validate_case", "Validated case", "info"],
    ["export_data", "Exported de-identified dataset", "warning"],
    ["failed_login", "Failed login attempt", "warning"],
    ["update_settings", "Changed AI confidence threshold", "warning"],
    ["permission_change", "Updated role permissions", "critical"],
  ]
  const audit: AuditEntry[] = Array.from({ length: 60 }, (_, i) => {
    const [action, detail, severity] = pick(rng, auditActions)
    const u = pick(rng, users)
    return {
      id: `AU-${9000 + i}`,
      at: iso(ago(Math.floor(rng() * 30), 23)),
      user: action === "failed_login" ? `${u.email} (unknown IP 102.89.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)})` : u.name,
      action,
      detail,
      severity,
    }
  }).sort((a, b) => b.at.localeCompare(a.at))

  const inquiries: Inquiry[] = [
    {
      id: "INQ-1",
      name: "Dr. Thandiwe Ndlovu",
      email: "t.ndlovu@example.org",
      institution: "Regional Neurology Unit, Bulawayo",
      message: "We would like to join as a validation site. We have a 1.5T scanner and ~40 stroke admissions/month.",
      at: iso(ago(3, 10)),
      read: false,
    },
    {
      id: "INQ-2",
      name: "Marco Rinaldi",
      email: "m.rinaldi@example.org",
      institution: "Global Health Imaging Consortium",
      message: "Is the de-identified dataset available for external benchmarking?",
      at: iso(ago(12, 10)),
      read: true,
    },
  ]

  return {
    version: DB_VERSION,
    users,
    patients,
    scans,
    annotations: [],
    cases,
    reports,
    audit,
    inquiries,
    permissions: DEFAULT_PERMISSIONS,
    settings: {
      studyName: "Computer-aided Detection of Ischemic Stroke in LMIC",
      aiConfidenceThreshold: 0.85,
      activeModelVersion: ACTIVE_MODEL_VERSION,
      autoRunAI: true,
      requireDoubleReview: true,
      sessionTimeoutMin: 30,
      maxUploadMb: 10,
      maintenanceMode: false,
      emailNotifications: true,
    },
    sites: SITES,
  }
}

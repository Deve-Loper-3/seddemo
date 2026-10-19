"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { simulatePrediction } from "./ai"
import { buildSeed, DB_VERSION } from "./seed"
import type {
  Annotation,
  AuditEntry,
  CaseDiscussion,
  DB,
  Inquiry,
  Patient,
  Permission,
  Report,
  Review,
  Role,
  Scan,
  Settings,
  User,
} from "./types"

const STORAGE_KEY = "strokeai-demo-db"
const SESSION_KEY = "strokeai-session-user"
const AI_PROCESSING_MS = 3500

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`

function nextId(items: { id: string }[], prefix: string, start: number) {
  const nums = items.map((i) => Number(i.id.split("-")[1])).filter((n) => !Number.isNaN(n))
  return `${prefix}-${Math.max(start - 1, ...nums) + 1}`
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DB
      if (parsed.version === DB_VERSION) return parsed
    }
  } catch {
    // fall through to a fresh seed
  }
  return buildSeed()
}

type NewScan = Pick<Scan, "patientId" | "sequence" | "image" | "fileName" | "fileSizeMb" | "slices">

type Store = {
  db: DB | null
  user: User | null
  ready: boolean
  login: (email: string, password: string) => { ok: true; user: User } | { ok: false; error: string }
  logout: () => void
  can: (p: Permission) => boolean
  log: (action: string, detail: string, severity?: AuditEntry["severity"]) => void
  // patients
  addPatient: (p: Omit<Patient, "id" | "createdAt" | "updatedAt" | "createdBy">) => Patient
  updatePatient: (id: string, patch: Partial<Patient>) => void
  deletePatient: (id: string) => void
  // scans
  addScan: (s: NewScan) => Scan
  rerunAI: (scanId: string) => void
  deleteScan: (scanId: string) => void
  submitRadiologistReview: (scanId: string, r: Omit<Review, "reviewer" | "at">) => void
  submitExpertValidation: (scanId: string, r: Omit<Review, "reviewer" | "at">) => void
  // annotations
  addAnnotation: (a: Omit<Annotation, "id" | "author" | "authorRole" | "createdAt">) => void
  // cases
  addCase: (c: Pick<CaseDiscussion, "scanId" | "title" | "priority"> & { firstComment: string }) => void
  addComment: (caseId: string, text: string) => void
  setCaseStatus: (caseId: string, status: CaseDiscussion["status"]) => void
  // reports
  addReport: (r: Omit<Report, "id" | "author" | "createdAt">) => Report
  updateReport: (id: string, patch: Partial<Report>) => void
  deleteReport: (id: string) => void
  // admin
  addUser: (u: Omit<User, "id" | "createdAt">) => { ok: boolean; error?: string }
  updateUser: (id: string, patch: Partial<User>) => void
  deleteUser: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  setPermissions: (role: Role, perms: Permission[]) => void
  addInquiry: (i: Omit<Inquiry, "id" | "at" | "read">) => void
  markInquiryRead: (id: string, read?: boolean) => void
  resetDemo: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const dbRef = useRef<DB | null>(null)
  dbRef.current = db

  // hydrate from localStorage on the client
  useEffect(() => {
    setDb(loadDB())
    setUserId(sessionStorage.getItem(SESSION_KEY))
    // keep several tabs (e.g. a radiologist and a doctor side by side) in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setDb(JSON.parse(e.newValue))
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    if (!db) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch (err) {
      console.error("Could not persist demo data (storage full?)", err)
    }
  }, [db])

  const user = useMemo(() => db?.users.find((u) => u.id === userId && u.status === "active") ?? null, [db, userId])
  const userRef = useRef(user)
  userRef.current = user

  const mutate = useCallback((fn: (draft: DB) => void) => {
    setDb((prev) => {
      if (!prev) return prev
      const draft = structuredClone(prev)
      fn(draft)
      return draft
    })
  }, [])

  const pushAudit = (draft: DB, action: string, detail: string, severity: AuditEntry["severity"] = "info", who?: string) => {
    draft.audit.unshift({
      id: uid("AU"),
      at: new Date().toISOString(),
      user: who ?? userRef.current?.name ?? "anonymous",
      action,
      detail,
      severity,
    })
    draft.audit = draft.audit.slice(0, 500)
  }

  // Simulated AI pipeline: any scan sitting in "processing" gets a prediction after a short delay.
  useEffect(() => {
    if (!db) return
    const processing = db.scans.filter((s) => s.status === "processing")
    if (processing.length === 0 || !db.settings.autoRunAI) return
    const timers = processing.map((s) => {
      const elapsed = Date.now() - new Date(s.uploadedAt).getTime()
      return setTimeout(
        () => {
          mutate((d) => {
            const scan = d.scans.find((x) => x.id === s.id)
            if (!scan || scan.status !== "processing") return
            scan.ai = simulatePrediction({ image: scan.image, sequence: scan.sequence, modelVersion: d.settings.activeModelVersion })
            scan.status = "pending-radiologist"
            pushAudit(d, "ai_inference", `${d.settings.activeModelVersion} analysed ${scan.id} → ${scan.ai.label} (${Math.round(scan.ai.confidence * 100)}%)`, "info", "AI pipeline")
          })
        },
        Math.max(0, AI_PROCESSING_MS - elapsed),
      )
    })
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db?.scans, db?.settings.autoRunAI, mutate])

  const store: Store = {
    db,
    user,
    ready: db !== null,

    login(email, password) {
      const d = dbRef.current
      if (!d) return { ok: false, error: "Still loading, try again." }
      const u = d.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
      if (!u || u.password !== password) {
        mutate((dr) => pushAudit(dr, "failed_login", `Failed login for ${email}`, "warning", email || "unknown"))
        return { ok: false, error: "Invalid email or password" }
      }
      if (u.status !== "active") {
        mutate((dr) => pushAudit(dr, "failed_login", `Suspended account ${email} attempted login`, "warning", u.name))
        return { ok: false, error: "This account is suspended. Contact an administrator." }
      }
      if (d.settings.maintenanceMode && u.role !== "admin") {
        return { ok: false, error: "The platform is in maintenance mode. Only administrators can sign in." }
      }
      sessionStorage.setItem(SESSION_KEY, u.id)
      setUserId(u.id)
      mutate((dr) => {
        const x = dr.users.find((y) => y.id === u.id)!
        x.lastLogin = new Date().toISOString()
        pushAudit(dr, "login", "Signed in", "info", u.name)
      })
      return { ok: true, user: u }
    },

    logout() {
      if (userRef.current) mutate((d) => pushAudit(d, "logout", "Signed out"))
      sessionStorage.removeItem(SESSION_KEY)
      setUserId(null)
    },

    can(p) {
      const u = userRef.current
      const d = dbRef.current
      return !!u && !!d && d.permissions[u.role].includes(p)
    },

    log(action, detail, severity) {
      mutate((d) => pushAudit(d, action, detail, severity))
    },

    addPatient(p) {
      const now = new Date().toISOString()
      const patient: Patient = {
        ...p,
        id: nextId(dbRef.current?.patients ?? [], "PT", 1001),
        createdAt: now,
        updatedAt: now,
        createdBy: userRef.current?.name ?? "unknown",
      }
      mutate((d) => {
        d.patients.unshift(patient)
        pushAudit(d, "create_patient", `Registered ${patient.id} (${patient.site})`)
      })
      return patient
    },

    updatePatient(id, patch) {
      mutate((d) => {
        const p = d.patients.find((x) => x.id === id)
        if (!p) return
        Object.assign(p, patch, { updatedAt: new Date().toISOString() })
        pushAudit(d, "update_patient", `Updated ${id}`)
      })
    },

    deletePatient(id) {
      mutate((d) => {
        const scanIds = new Set(d.scans.filter((s) => s.patientId === id).map((s) => s.id))
        d.patients = d.patients.filter((p) => p.id !== id)
        d.scans = d.scans.filter((s) => s.patientId !== id)
        d.annotations = d.annotations.filter((a) => !scanIds.has(a.scanId))
        d.cases = d.cases.filter((c) => !scanIds.has(c.scanId))
        pushAudit(d, "delete_patient", `Deleted ${id} and ${scanIds.size} scan(s)`, "warning")
      })
    },

    addScan(s) {
      const scan: Scan = {
        ...s,
        id: nextId(dbRef.current?.scans ?? [], "MRI", 2001),
        uploadedBy: userRef.current?.name ?? "unknown",
        uploadedAt: new Date().toISOString(),
        status: "processing",
      }
      mutate((d) => {
        d.scans.unshift(scan)
        pushAudit(d, "upload_scan", `Uploaded ${scan.id} (${scan.sequence}) for ${scan.patientId}`)
      })
      return scan
    },

    rerunAI(scanId) {
      mutate((d) => {
        const s = d.scans.find((x) => x.id === scanId)
        if (!s) return
        s.status = "processing"
        s.ai = undefined
        s.radiologistReview = undefined
        s.expertValidation = undefined
        s.uploadedAt = new Date().toISOString()
        pushAudit(d, "rerun_ai", `Re-queued ${scanId} for AI inference`)
      })
    },

    deleteScan(scanId) {
      mutate((d) => {
        d.scans = d.scans.filter((s) => s.id !== scanId)
        d.annotations = d.annotations.filter((a) => a.scanId !== scanId)
        d.cases = d.cases.filter((c) => c.scanId !== scanId)
        pushAudit(d, "delete_scan", `Deleted ${scanId}`, "warning")
      })
    },

    submitRadiologistReview(scanId, r) {
      mutate((d) => {
        const s = d.scans.find((x) => x.id === scanId)
        if (!s) return
        s.radiologistReview = { ...r, reviewer: userRef.current?.name ?? "unknown", at: new Date().toISOString() }
        if (s.status !== "validated") s.status = d.settings.requireDoubleReview ? "pending-validation" : "validated"
        pushAudit(d, "review_ai", `Radiologist marked ${scanId} AI result as ${r.verdict}`)
      })
    },

    submitExpertValidation(scanId, r) {
      mutate((d) => {
        const s = d.scans.find((x) => x.id === scanId)
        if (!s) return
        s.expertValidation = { ...r, reviewer: userRef.current?.name ?? "unknown", at: new Date().toISOString() }
        s.status = "validated"
        pushAudit(d, "validate_case", `Expert validated ${scanId}: AI ${r.verdict}, final = ${r.finalLabel}`)
      })
    },

    addAnnotation(a) {
      mutate((d) => {
        d.annotations.unshift({
          ...a,
          id: uid("AN"),
          author: userRef.current?.name ?? "unknown",
          authorRole: userRef.current?.role ?? "doctor",
          createdAt: new Date().toISOString(),
        })
        pushAudit(d, "annotate", `Saved annotation on ${a.scanId}${a.forRetraining ? " (queued for retraining)" : ""}`)
      })
    },

    addCase({ firstComment, ...c }) {
      const now = new Date().toISOString()
      const author = userRef.current?.name ?? "unknown"
      mutate((d) => {
        const id = nextId(d.cases, "CR", 301)
        d.cases.unshift({
          ...c,
          id,
          status: "open",
          createdBy: author,
          createdAt: now,
          comments: firstComment ? [{ id: uid("CM"), author, text: firstComment, at: now }] : [],
        })
        pushAudit(d, "open_case", `Opened case review ${id} for ${c.scanId}`)
      })
    },

    addComment(caseId, text) {
      mutate((d) => {
        const c = d.cases.find((x) => x.id === caseId)
        if (!c) return
        c.comments.push({ id: uid("CM"), author: userRef.current?.name ?? "unknown", text, at: new Date().toISOString() })
      })
    },

    setCaseStatus(caseId, status) {
      mutate((d) => {
        const c = d.cases.find((x) => x.id === caseId)
        if (!c) return
        c.status = status
        pushAudit(d, "case_status", `${caseId} marked ${status}`)
      })
    },

    addReport(r) {
      const report: Report = {
        ...r,
        id: nextId(dbRef.current?.reports ?? [], "RPT", 501),
        author: userRef.current?.name ?? "unknown",
        createdAt: new Date().toISOString(),
      }
      mutate((d) => {
        d.reports.unshift(report)
        pushAudit(d, "create_report", `Generated report ${report.id}: ${report.title}`)
      })
      return report
    },

    updateReport(id, patch) {
      mutate((d) => {
        const r = d.reports.find((x) => x.id === id)
        if (!r) return
        Object.assign(r, patch)
        if (patch.status === "published") pushAudit(d, "publish_report", `Published ${id}`)
      })
    },

    deleteReport(id) {
      mutate((d) => {
        d.reports = d.reports.filter((r) => r.id !== id)
        pushAudit(d, "delete_report", `Deleted ${id}`)
      })
    },

    addUser(u) {
      const d0 = dbRef.current
      if (d0?.users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
        return { ok: false, error: "A user with this email already exists." }
      }
      mutate((d) => {
        d.users.push({ ...u, id: nextId(d.users, "U", 100), createdAt: new Date().toISOString() })
        pushAudit(d, "create_user", `Created ${u.role} account ${u.email}`, "warning")
      })
      return { ok: true }
    },

    updateUser(id, patch) {
      mutate((d) => {
        const u = d.users.find((x) => x.id === id)
        if (!u) return
        Object.assign(u, patch)
        pushAudit(d, "update_user", `Updated ${u.email}${patch.status ? ` → ${patch.status}` : ""}`, "warning")
      })
    },

    deleteUser(id) {
      mutate((d) => {
        const u = d.users.find((x) => x.id === id)
        d.users = d.users.filter((x) => x.id !== id)
        pushAudit(d, "delete_user", `Deleted account ${u?.email}`, "critical")
      })
    },

    updateSettings(patch) {
      mutate((d) => {
        d.settings = { ...d.settings, ...patch }
        pushAudit(d, "update_settings", `Changed ${Object.keys(patch).join(", ")}`, "warning")
      })
    },

    setPermissions(role, perms) {
      mutate((d) => {
        d.permissions[role] = perms
        pushAudit(d, "permission_change", `Updated permissions for ${role}`, "critical")
      })
    },

    addInquiry(i) {
      mutate((d) => {
        d.inquiries.unshift({ ...i, id: uid("INQ"), at: new Date().toISOString(), read: false })
      })
    },

    markInquiryRead(id, read = true) {
      mutate((d) => {
        const i = d.inquiries.find((x) => x.id === id)
        if (i) i.read = read
      })
    },

    resetDemo() {
      const fresh = buildSeed()
      setDb(fresh)
      // keep the current user signed in if they still exist in the fresh seed
      const still = fresh.users.find((u) => u.email === userRef.current?.email)
      if (still) {
        sessionStorage.setItem(SESSION_KEY, still.id)
        setUserId(still.id)
      }
    },
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>")
  return ctx
}

/** Convenience: db is guaranteed non-null inside the dashboard shell. */
export function useDB() {
  const { db } = useStore()
  return db as DB
}

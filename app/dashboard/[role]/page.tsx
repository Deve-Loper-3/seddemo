"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard-shell"
import { StatCard } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { isRole, ROLE_CONFIG } from "@/lib/roles"
import { adjudicated, confusion, fromNow, pct, scores } from "@/lib/metrics"
import type { DB, Role } from "@/lib/types"

type Todo = { label: string; count: number; href: string }

function roleSummary(role: Role, db: DB, userName: string): { stats: { label: string; value: string | number }[]; todos: Todo[] } {
  const s = scores(confusion(db.scans))
  const by = (st: string) => db.scans.filter((x) => x.status === st).length
  const today = new Date().toDateString()
  switch (role) {
    case "doctor":
      return {
        stats: [
          { label: "Cases validated", value: by("validated") },
          { label: "Model accuracy (adjudicated)", value: pct(s.accuracy) },
          { label: "My validations", value: db.scans.filter((x) => x.expertValidation?.reviewer === userName).length },
          { label: "Sites contributing", value: new Set(db.patients.map((p) => p.site)).size },
        ],
        todos: [
          { label: "Cases awaiting your validation", count: by("pending-validation"), href: "/dashboard/doctor/ai-predictions-review" },
          {
            label: "Discharged patients missing 90-day mRS",
            count: db.patients.filter((p) => p.status === "Discharged" && p.mrs90 === undefined).length,
            href: "/dashboard/doctor/treatment-outcomes",
          },
        ],
      }
    case "radiologist":
      return {
        stats: [
          { label: "Reading queue", value: by("pending-radiologist") },
          { label: "AI sensitivity", value: pct(s.sensitivity) },
          { label: "My reads", value: db.scans.filter((x) => x.radiologistReview?.reviewer === userName).length },
          { label: "Open case discussions", value: db.cases.filter((c) => c.status === "open").length },
        ],
        todos: [
          { label: "Studies awaiting your read", count: by("pending-radiologist"), href: "/dashboard/radiologist/ai-predictions" },
          { label: "Open case discussions", count: db.cases.filter((c) => c.status === "open").length, href: "/dashboard/radiologist/case-reviews" },
          { label: "Studies still in AI processing", count: by("processing"), href: "/dashboard/radiologist/mri-analysis" },
        ],
      }
    case "data-entry":
      return {
        stats: [
          { label: "Patients enrolled", value: db.patients.length },
          { label: "MRI studies", value: db.scans.length },
          { label: "Entered today", value: db.patients.filter((p) => new Date(p.createdAt).toDateString() === today).length },
          { label: "Sites", value: db.sites.length },
        ],
        todos: [
          {
            label: "Patients without any MRI uploaded",
            count: db.patients.filter((p) => !db.scans.some((s) => s.patientId === p.id)).length,
            href: "/dashboard/data-entry/scan-upload",
          },
          {
            label: "Records missing treatment data",
            count: db.patients.filter((p) => p.status !== "Admitted" && !p.treatment).length,
            href: "/dashboard/data-entry/database-management",
          },
        ],
      }
    case "analyst":
      return {
        stats: [
          { label: "Adjudicated scans", value: adjudicated(db.scans).length },
          { label: "Accuracy", value: pct(s.accuracy) },
          { label: "F1 score", value: s.f1.toFixed(3) },
          { label: "Reports", value: db.reports.length },
        ],
        todos: [
          { label: "Draft reports", count: db.reports.filter((r) => r.status === "draft").length, href: "/dashboard/analyst/research-reports" },
        ],
      }
    case "admin":
      return {
        stats: [
          { label: "Users", value: db.users.length },
          { label: "Active users", value: db.users.filter((u) => u.status === "active").length },
          { label: "Audit events (24 h)", value: db.audit.filter((a) => Date.now() - new Date(a.at).getTime() < 86_400_000).length },
          { label: "Unread inquiries", value: db.inquiries.filter((i) => !i.read).length },
        ],
        todos: [
          { label: "Unread contact inquiries", count: db.inquiries.filter((i) => !i.read).length, href: "/dashboard/admin/system-analytics" },
          { label: "Suspended accounts", count: db.users.filter((u) => u.status === "suspended").length, href: "/dashboard/admin/user-management" },
          {
            label: "Security warnings (7 days)",
            count: db.audit.filter((a) => a.severity !== "info" && Date.now() - new Date(a.at).getTime() < 7 * 86_400_000).length,
            href: "/dashboard/admin/security-access",
          },
        ],
      }
  }
}

export default function DashboardPage() {
  const params = useParams()
  const role = params.role as string
  const db = useDB()
  const { user } = useStore()
  if (!isRole(role) || !user) return null

  const config = ROLE_CONFIG[role]
  const { stats, todos } = roleSummary(role, db, user.name)
  const myActivity = db.audit.filter((a) => a.user === user.name).slice(0, 6)

  return (
    <div>
      <PageHeader title={config.title} description={config.description} icon={config.icon} />

      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Brain className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Welcome back, {user.name}</h2>
              <p className="text-muted-foreground text-sm">
                {db.settings.studyName} · {user.site}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {todos.map((t) => (
                  <Link key={t.label} href={t.href} className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm hover:border-primary transition-colors">
                    <span>{t.label}</span>
                    <span className={`ml-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.count ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {t.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid md:grid-cols-2 gap-6">
          {config.features.map((feature) => (
            <Card key={feature.slug} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="flex-1">
                <feature.icon className="h-9 w-9 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/${role}/${feature.slug}`}>
                    Open {feature.title} <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Your recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {myActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {myActivity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <div>{a.detail}</div>
                    <div className="text-xs text-muted-foreground">{fromNow(a.at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

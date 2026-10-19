"use client"

import { format, subDays } from "date-fns"
import { Activity, Database, HardDrive, Mail, MailOpen, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/dashboard-shell"
import { CHART_COLORS, StatCard } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { fromNow } from "@/lib/metrics"
import { ROLE_LABELS, type Role } from "@/lib/types"

export default function SystemAnalyticsPage() {
  const db = useDB()
  const { markInquiryRead } = useStore()

  const activity = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i)
    const key = d.toDateString()
    const ev = db.audit.filter((a) => new Date(a.at).toDateString() === key)
    return { day: format(d, "d MMM"), Events: ev.length, Logins: ev.filter((a) => a.action === "login").length }
  })

  const pipeline = [
    { name: "AI processing", value: db.scans.filter((s) => s.status === "processing").length },
    { name: "Awaiting radiologist", value: db.scans.filter((s) => s.status === "pending-radiologist").length },
    { name: "Awaiting validation", value: db.scans.filter((s) => s.status === "pending-validation").length },
    { name: "Validated", value: db.scans.filter((s) => s.status === "validated").length },
  ]

  const activeUsers7 = new Set(db.audit.filter((a) => a.action === "login" && Date.now() - new Date(a.at).getTime() < 7 * 86_400_000).map((a) => a.user)).size
  const storageMb = db.scans.reduce((a, s) => a + s.fileSizeMb, 0)
  let localBytes = 0
  try {
    localBytes = (localStorage.getItem("strokeai-demo-db") ?? "").length * 2
  } catch {}

  const byRole = (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
    role: ROLE_LABELS[r],
    actions: db.audit.filter((a) => db.users.find((u) => u.name === a.user)?.role === r).length,
  }))

  return (
    <div>
      <PageHeader title="System Analytics" description="Platform usage, pipeline health and contact inquiries" icon={Activity} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active users (7 days)" value={activeUsers7} icon={Users} />
        <StatCard label="Total MRI studies" value={db.scans.length} icon={Database} />
        <StatCard label="Imaging storage (simulated)" value={`${(storageMb / 1024).toFixed(2)} GB`} icon={HardDrive} />
        <StatCard label="Unread inquiries" value={db.inquiries.filter((i) => !i.read).length} icon={Mail} tone="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform activity</CardTitle>
            <CardDescription>Audit events per day (last 14 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Events" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Logins" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review pipeline</CardTitle>
            <CardDescription>Where every scan currently sits</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pipeline} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {pipeline.map((_, i) => (
                    <Cell key={i} fill={["#0ea5e9", "#f97316", "#8b5cf6", "#10b981"][i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>System health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              ["AI inference service", db.settings.autoRunAI ? "Operational" : "Paused", db.settings.autoRunAI ? 100 : 0],
              ["Active model", db.settings.activeModelVersion, 100],
              ["Browser storage used", `${(localBytes / 1024).toFixed(0)} KB of ~5 MB`, Math.min(100, (localBytes / (5 * 1024 * 1024)) * 100)],
              ["Maintenance mode", db.settings.maintenanceMode ? "ON" : "Off", db.settings.maintenanceMode ? 100 : 0],
            ].map(([k, v, p]) => (
              <div key={k as string}>
                <div className="flex justify-between mb-1">
                  <span>{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
                <Progress value={p as number} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions by role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {byRole.map((r) => (
              <div key={r.role}>
                <div className="flex justify-between mb-1">
                  <span>{r.role}</span>
                  <span className="tabular-nums">{r.actions}</span>
                </div>
                <Progress value={(r.actions / Math.max(1, ...byRole.map((x) => x.actions))) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact inquiries</CardTitle>
            <CardDescription>Submitted from the public website</CardDescription>
          </CardHeader>
          <CardContent>
            {db.inquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries.</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {db.inquiries.map((i) => (
                  <li key={i.id} className={`rounded-lg border p-3 text-sm ${i.read ? "" : "border-primary/40 bg-primary/5"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{i.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {i.email}
                          {i.institution && ` · ${i.institution}`}
                        </div>
                      </div>
                      {!i.read && <Badge>New</Badge>}
                    </div>
                    <p className="mt-2">{i.message}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{fromNow(i.at)}</span>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => markInquiryRead(i.id, !i.read)}>
                        {i.read ? <Mail className="h-3.5 w-3.5 mr-1" /> : <MailOpen className="h-3.5 w-3.5 mr-1" />}
                        Mark {i.read ? "unread" : "read"}
                      </Button>
                    </div>
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

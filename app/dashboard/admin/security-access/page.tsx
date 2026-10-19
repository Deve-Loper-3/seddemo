"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Download, Search, Shield, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard-shell"
import { StatCard } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { DEFAULT_PERMISSIONS } from "@/lib/seed"
import { downloadFile, fmtDateTime, toCSV } from "@/lib/metrics"
import { PERMISSION_LABELS, ROLE_LABELS, type Permission, type Role } from "@/lib/types"

const ROLES = Object.keys(ROLE_LABELS) as Role[]
const PERMS = Object.keys(PERMISSION_LABELS) as Permission[]

export default function SecurityAccessPage() {
  const db = useDB()
  const { setPermissions } = useStore()
  const [q, setQ] = useState("")
  const [sev, setSev] = useState("all")
  const [limit, setLimit] = useState(25)

  const toggle = (role: Role, perm: Permission, on: boolean) => {
    if (role === "admin" && (perm === "manage_users" || perm === "manage_settings")) {
      toast.error("Administrators must keep user and settings management")
      return
    }
    const current = db.permissions[role]
    setPermissions(role, on ? [...current, perm] : current.filter((p) => p !== perm))
    toast.success(`${ROLE_LABELS[role]}: ${on ? "granted" : "revoked"} “${PERMISSION_LABELS[perm]}”`)
  }

  const audit = useMemo(() => {
    const n = q.trim().toLowerCase()
    return db.audit
      .filter((a) => sev === "all" || a.severity === sev)
      .filter((a) => !n || `${a.user} ${a.action} ${a.detail}`.toLowerCase().includes(n))
  }, [db.audit, q, sev])

  const week = db.audit.filter((a) => Date.now() - new Date(a.at).getTime() < 7 * 86_400_000)

  return (
    <div>
      <PageHeader title="Security & Access" description="Role-based permissions and the platform audit trail" icon={Shield} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Audit events (7 days)" value={week.length} />
        <StatCard label="Failed logins (7 days)" value={week.filter((a) => a.action === "failed_login").length} tone="orange" icon={AlertTriangle} />
        <StatCard label="Critical events (7 days)" value={week.filter((a) => a.severity === "critical").length} tone="red" icon={ShieldAlert} />
        <StatCard label="Suspended accounts" value={db.users.filter((u) => u.status === "suspended").length} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Permission matrix</CardTitle>
              <CardDescription>Changes take effect immediately (e.g. revoke “Annotate lesions” and the radiologist’s drawing tools lock).</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                ROLES.forEach((r) => setPermissions(r, DEFAULT_PERMISSIONS[r]))
                toast.success("Permissions restored to defaults")
              }}
            >
              Restore defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                {ROLES.map((r) => (
                  <TableHead key={r} className="text-center text-xs">
                    {ROLE_LABELS[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMS.map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium text-sm">{PERMISSION_LABELS[p]}</TableCell>
                  {ROLES.map((r) => (
                    <TableCell key={r} className="text-center">
                      <Checkbox checked={db.permissions[r].includes(p)} onCheckedChange={(on) => toggle(r, p, !!on)} aria-label={`${r} ${p}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Audit log</CardTitle>
              <CardDescription>{audit.length} events · every action on the platform is recorded here</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                downloadFile("audit-log.csv", toCSV(audit.map((a) => ({ time: a.at, user: a.user, action: a.action, detail: a.detail, severity: a.severity }))), "text/csv")
                toast.success("Audit log exported")
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
          <div className="flex flex-col gap-2 md:flex-row pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Filter by user, action or detail…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={sev} onValueChange={setSev}>
              <SelectTrigger className="md:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.slice(0, limit).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs whitespace-nowrap">{fmtDateTime(a.at)}</TableCell>
                  <TableCell className="text-sm">{a.user}</TableCell>
                  <TableCell className="font-mono text-xs">{a.action}</TableCell>
                  <TableCell className="text-sm">{a.detail}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        a.severity === "critical"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : a.severity === "warning"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-600"
                      }
                    >
                      {a.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {audit.length > limit && (
            <Button variant="outline" className="w-full mt-4" onClick={() => setLimit((l) => l + 25)}>
              Load more
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

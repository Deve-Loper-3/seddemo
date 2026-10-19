"use client"

import { useMemo, useState } from "react"
import { Ban, CheckCircle2, KeyRound, Pencil, Search, Trash2, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/dashboard-shell"
import { StatCard } from "@/components/common"
import { useDB, useStore } from "@/lib/store"
import { fromNow } from "@/lib/metrics"
import { ROLE_LABELS, type Role, type User } from "@/lib/types"

type FormState = { id?: string; name: string; email: string; password: string; role: Role; site: string; status: User["status"] }

export default function UserManagementPage() {
  const db = useDB()
  const { user: me, addUser, updateUser, deleteUser } = useStore()
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [form, setForm] = useState<FormState | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [error, setError] = useState("")

  const users = useMemo(() => {
    const n = q.trim().toLowerCase()
    return db.users
      .filter((u) => roleFilter === "all" || u.role === roleFilter)
      .filter((u) => !n || `${u.name} ${u.email} ${u.site}`.toLowerCase().includes(n))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [db.users, q, roleFilter])

  const openNew = () => {
    setError("")
    setForm({ name: "", email: "", password: "", role: "data-entry", site: db.sites[0], status: "active" })
  }
  const openEdit = (u: User) => {
    setError("")
    setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role, site: u.site, status: u.status })
  }

  const save = () => {
    if (!form) return
    if (form.name.trim().length < 3) return setError("Name is required")
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email")
    if (!form.id && form.password.length < 6) return setError("Password must be at least 6 characters")
    if (form.id) {
      const clash = db.users.some((u) => u.id !== form.id && u.email.toLowerCase() === form.email.toLowerCase())
      if (clash) return setError("Another user already uses this email")
      const patch: Partial<User> = { name: form.name.trim(), email: form.email.trim(), role: form.role, site: form.site, status: form.status }
      if (form.password) patch.password = form.password
      updateUser(form.id, patch)
      toast.success("User updated")
    } else {
      const res = addUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role, site: form.site, status: form.status })
      if (!res.ok) return setError(res.error!)
      toast.success(`Account created – ${form.email} can now sign in`)
    }
    setForm(null)
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Create, edit, suspend and remove study accounts"
        icon={Users}
        actions={
          <Button onClick={openNew}>
            <UserPlus className="h-4 w-4 mr-2" /> Add user
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total users" value={db.users.length} />
        {(["doctor", "radiologist", "data-entry", "analyst"] as Role[]).map((r) => (
          <StatCard key={r} label={ROLE_LABELS[r]} value={db.users.filter((u) => u.role === r).length} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            {db.users.filter((u) => u.status === "active").length} active · {db.users.filter((u) => u.status === "suspended").length} suspended
          </CardDescription>
          <div className="flex flex-col gap-2 md:flex-row pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search name, email or site…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="md:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">
                      {u.name} {u.id === me?.id && <span className="text-xs text-muted-foreground">(you)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ROLE_LABELS[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{u.site}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{u.lastLogin ? fromNow(u.lastLogin) : "never"}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={u.status === "active" ? "Suspend" : "Activate"}
                      disabled={u.id === me?.id}
                      onClick={() => {
                        const next = u.status === "active" ? "suspended" : "active"
                        updateUser(u.id, { status: next })
                        toast.success(`${u.name} ${next === "active" ? "re-activated" : "suspended"}`)
                      }}
                    >
                      {u.status === "active" ? <Ban className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Reset password"
                      onClick={() => {
                        const pw = `reset${Math.floor(1000 + Math.random() * 9000)}`
                        updateUser(u.id, { password: pw })
                        toast.success(`Temporary password for ${u.email}: ${pw}`, { duration: 10000 })
                      }}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" disabled={u.id === me?.id} onClick={() => setDeleting(u)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          {form && (
            <>
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit user" : "Add user"}</DialogTitle>
                <DialogDescription>{form.id ? "Leave the password blank to keep the current one." : "The new account can sign in immediately."}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
                <div className="space-y-2">
                  <Label htmlFor="u-name">Full name</Label>
                  <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-email">Email</Label>
                  <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-pw">{form.id ? "New password (optional)" : "Password"}</Label>
                  <Input id="u-pw" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })} disabled={form.id === me?.id}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as User["status"] })} disabled={form.id === me?.id}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Site</Label>
                  <Select value={form.site} onValueChange={(v) => setForm({ ...form, site: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {db.sites.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setForm(null)}>
                  Cancel
                </Button>
                <Button onClick={save}>{form.id ? "Save" : "Create account"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>The account {deleting?.email} will be removed permanently. Their past reviews stay in the record.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleting) {
                  deleteUser(deleting.id)
                  toast.success("User deleted")
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

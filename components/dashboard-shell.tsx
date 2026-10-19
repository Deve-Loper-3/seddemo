"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Brain, ChevronDown, LogOut, Menu, RotateCcw, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/lib/store"
import { isRole, ROLE_CONFIG } from "@/lib/roles"
import { ROLE_LABELS } from "@/lib/types"
import { cn } from "@/lib/utils"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, user, logout, resetDemo, db } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = pathname.split("/")[2] ?? ""

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    else if (user.role !== role) router.replace(`/dashboard/${user.role}`)
  }, [ready, user, role, pathname, router])

  useEffect(() => setMobileOpen(false), [pathname])

  if (!ready || !user || user.role !== role || !isRole(role)) {
    return (
      <div className="container mx-auto px-4 pt-24 space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96" />
        <div className="grid md:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  const config = ROLE_CONFIG[role]
  const nav = [{ href: `/dashboard/${role}`, title: "Overview", short: "Overview" }, ...config.features.map((f) => ({ href: `/dashboard/${role}/${f.slug}`, title: f.title, short: f.short ?? f.title }))]

  const handleLogout = () => {
    logout()
    toast.success("Signed out")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
            <Brain className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Stroke AI Study</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                title={n.title}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname === n.href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {n.short}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {db?.settings.maintenanceMode && (
              <span className="hidden md:inline rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">Maintenance mode</span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {user.name
                      .replace(/^Dr\. /, "")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
                  <div className="text-xs font-normal text-muted-foreground">{user.site}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setConfirmReset(true)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset demo data
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="lg:hidden border-t px-4 py-2 flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn("rounded-md px-3 py-2 text-sm", pathname === n.href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground")}
              >
                {n.title}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 pb-20">{children}</main>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              This discards every change made in this browser (new patients, uploads, reviews, users, settings) and restores the original dummy dataset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetDemo()
                toast.success("Demo data restored")
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {Icon && <Icon className="h-7 w-7 text-primary" />}
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

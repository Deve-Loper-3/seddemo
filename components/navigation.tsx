"use client"

import Link from "next/link"
import { useState } from "react"
import { Brain, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#workflow", label: "How it works" },
  { href: "/#gallery", label: "Imaging" },
  { href: "/#publications", label: "Publications" },
  { href: "/#contact", label: "Contact" },
]

export function Navigation() {
  const { user } = useStore()
  const [open, setOpen] = useState(false)

  const cta = user ? (
    <Button size="sm" asChild>
      <Link href={`/dashboard/${user.role}`}>Go to dashboard</Link>
    </Button>
  ) : (
    <Button variant="outline" size="sm" asChild>
      <Link href="/login">Login</Link>
    </Button>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Brain className="h-6 w-6 text-primary" />
          <span>Stroke AI Study</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
          {cta}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background px-4 py-3 flex flex-col gap-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
              {l.label}
            </Link>
          ))}
          {cta}
        </div>
      )}
    </nav>
  )
}

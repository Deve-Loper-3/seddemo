import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { StoreProvider } from "@/lib/store"
import "./globals.css"

export const metadata: Metadata = {
  title: "Stroke AI Research Study - Computer-aided Detection of Ischemic Strokes",
  description:
    "A retrospective cohort study exploring AI-powered detection and classification of ischemic strokes from MRI images in LMIC settings",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <StoreProvider>{children}</StoreProvider>
        <Toaster richColors position="top-right" />
        {/* the analytics script only exists when hosted on Vercel */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}

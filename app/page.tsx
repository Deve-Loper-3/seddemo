"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Brain, CheckCircle2, Copy, Download, ExternalLink, FileText, Globe, ScanLine, Stethoscope, Upload, Users } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { ContactForm } from "@/components/contact-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SAMPLE_IMAGES, SITE_IMAGES } from "@/lib/images"
import { useStore } from "@/lib/store"
import { downloadFile } from "@/lib/metrics"

const PUBLICATIONS = [
  {
    year: "2024",
    title: "Deep Learning Approaches for Ischemic Stroke Detection",
    venue: "Journal of Medical Imaging and AI • Vol. 12, Issue 3",
    abstract:
      "A comprehensive analysis of convolutional neural network architectures for automated detection of acute ischemic stroke from diffusion-weighted MRI sequences.",
    doi: "10.0000/demo.jmiai.2024.0312",
    actions: ["PDF", "DOI"],
  },
  {
    year: "2024",
    title: "AI-Assisted Stroke Diagnosis in Resource-Limited Settings",
    venue: "International Conference on Medical AI • Poster Presentation",
    abstract:
      "Preliminary results from our retrospective cohort study demonstrating the feasibility and accuracy of AI-powered stroke detection in LMIC healthcare facilities.",
    doi: "10.0000/demo.icmai.2024.p17",
    actions: ["Poster", "Abstract"],
  },
  {
    year: "2023",
    title: "MRI-Based Stroke Classification Using Transfer Learning",
    venue: "Neuroradiology Research Quarterly • Vol. 45, Issue 2",
    abstract:
      "Evaluation of transfer learning techniques for improving stroke subtype classification accuracy with limited training datasets.",
    doi: "10.0000/demo.nrq.2023.4502",
    actions: ["PDF", "DOI"],
  },
]

const WORKFLOW = [
  { icon: Upload, title: "1. Capture", text: "Site data-entry staff register the patient and upload MRI studies (DWI, ADC, FLAIR…)." },
  { icon: Brain, title: "2. AI analysis", text: "An ensemble of CNNs classifies the study, localises the lesion and estimates infarct volume." },
  { icon: ScanLine, title: "3. Radiologist read", text: "A radiologist accepts or corrects the AI read and annotates lesions." },
  { icon: Stethoscope, title: "4. Expert validation", text: "A stroke physician gives the final adjudication used as ground truth." },
  { icon: FileText, title: "5. Analysis", text: "Analysts track accuracy, sensitivity and outcomes across sites and publish reports." },
]

export default function HomePage() {
  const { db } = useStore()
  const [citation, setCitation] = useState<(typeof PUBLICATIONS)[number] | null>(null)
  const heroImages = SAMPLE_IMAGES.filter((s) => s.finding === "ischemic").slice(0, 3)

  const stats = db
    ? [
        { value: db.patients.length, label: "Patients enrolled" },
        { value: db.scans.length, label: "MRI studies" },
        { value: db.scans.filter((s) => s.status === "validated").length, label: "Expert-validated" },
        { value: db.sites.length, label: "LMIC sites" },
      ]
    : null

  const onPubAction = (pub: (typeof PUBLICATIONS)[number], action: string) => {
    if (action === "DOI" || action === "Abstract") {
      setCitation(pub)
      return
    }
    downloadFile(
      `${pub.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`,
      `# ${pub.title}\n\n*${pub.venue}*\n\nDOI: ${pub.doi} (demo)\n\n## Abstract\n\n${pub.abstract}\n\n_This is placeholder content generated for the demo site._\n`,
      "text/markdown",
    )
    toast.success(`${action} downloaded`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">AI-Powered Medical Research</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight">
              Computer-aided Detection and Classification of Ischemic Strokes from MRI Images in LMIC
            </h1>
            <p className="text-xl text-muted-foreground mb-4">A Retrospective Cohort Study</p>
            <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
              This project explores the use of artificial intelligence for early detection and classification of ischemic strokes from MRI images, with a focus on
              improving healthcare access and outcomes in low- and middle-income countries (LMIC).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base">
                <a href="#about">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="/login">Open the research platform</Link>
              </Button>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            {heroImages.map((img, i) => (
              <figure key={img.src} className={`relative overflow-hidden rounded-xl bg-black shadow-xl ${i === 0 ? "row-span-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className="h-full w-full object-cover" />
                {img.lesion && (
                  <span
                    className="absolute rounded-full border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse"
                    style={{
                      left: `${(img.lesion.x - img.lesion.r) * 100}%`,
                      top: `${(img.lesion.y - img.lesion.r * 0.8) * 100}%`,
                      width: `${img.lesion.r * 200}%`,
                      height: `${img.lesion.r * 160}%`,
                    }}
                  />
                )}
                <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] text-white">{img.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {stats && (
        <section className="px-4 pb-16">
          <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border bg-card p-5 text-center">
                <div className="text-3xl font-bold text-primary tabular-nums">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">Live counts from the demo dataset</p>
        </section>
      )}

      {/* About */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About the Study</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">Understanding the critical need for accessible stroke detection technology</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Brain,
                title: "AI-Driven Detection",
                text: "Machine learning models analyze MRI scans to identify and classify ischemic stroke patterns with high accuracy, supporting clinical decision-making.",
              },
              {
                icon: Globe,
                title: "LMIC Focus",
                text: "Stroke is a leading cause of death and disability worldwide. In LMIC settings, limited access to specialists makes early detection challenging—our AI aims to bridge this gap.",
              },
              {
                icon: Users,
                title: "Collaborative Research",
                text: "The study brings together institutions and researchers in neurology, radiology, and artificial intelligence to advance stroke care globally.",
              },
            ].map((c) => (
              <Card key={c.title}>
                <CardHeader>
                  <c.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{c.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">
            <figure className="rounded-xl border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SITE_IMAGES[0].src} alt={SITE_IMAGES[0].title} className="w-full h-auto" />
              <figcaption className="mt-2 text-xs text-muted-foreground">
                How an ischemic stroke happens: an embolus blocks a cerebral artery and the brain tissue it supplies dies. Illustration: {SITE_IMAGES[0].credit}.
              </figcaption>
            </figure>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Research Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Background</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ischemic stroke accounts for approximately 87% of all strokes and requires rapid diagnosis for effective treatment. However, many LMIC healthcare
                    systems face shortages of trained radiologists and neurologists, leading to delayed or missed diagnoses. This retrospective cohort study investigates
                    whether AI-powered computer-aided detection can accurately identify and classify ischemic strokes from MRI images in resource-limited settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Key Objectives</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                    <li>Develop and validate deep learning models for automated stroke detection from MRI scans</li>
                    <li>Assess the accuracy and reliability of AI systems compared to expert radiologist interpretation</li>
                    <li>Evaluate the feasibility of deploying these tools in LMIC healthcare facilities</li>
                    <li>Identify barriers and opportunities for AI integration in resource-constrained environments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How the Platform Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every scan passes through a human-in-the-loop pipeline before it counts as ground truth.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {WORKFLOW.map((w) => (
              <Card key={w.title} className="relative">
                <CardHeader className="pb-2">
                  <w.icon className="h-8 w-8 text-primary mb-1" />
                  <CardTitle className="text-base">{w.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{w.text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Imaging Examples</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acute infarcts appear bright on diffusion-weighted imaging (DWI) and dark on the ADC map. Normal studies are included so the model learns what is not a stroke.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {SAMPLE_IMAGES.map((img) => (
              <figure key={img.src} className="overflow-hidden rounded-lg border bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className="aspect-square w-full object-cover" />
                <figcaption className="bg-card p-2 text-xs">
                  <div className="font-medium">{img.title}</div>
                  <span className={`inline-block mt-1 rounded px-1.5 py-0.5 text-[10px] ${img.finding === "normal" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-700"}`}>
                    {img.finding === "normal" ? "Normal" : img.finding === "angiography" ? "Angiography" : "Acute infarct"}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section id="publications" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Publications & Research Outputs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">Explore published research, conference presentations, and ongoing findings</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PUBLICATIONS.map((pub) => (
              <Card key={pub.title}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary" />
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{pub.year}</span>
                  </div>
                  <CardTitle className="mt-4">{pub.title}</CardTitle>
                  <CardDescription>{pub.venue}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{pub.abstract}</p>
                  <div className="flex gap-2">
                    {pub.actions.map((a) => (
                      <Button key={a} size="sm" variant="outline" onClick={() => onPubAction(pub, a)}>
                        {a === "DOI" || a === "Abstract" ? <ExternalLink className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                        {a}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">In Progress</span>
                </div>
                <CardTitle className="mt-4">Clinical Validation Study: AI vs. Expert Radiologists</CardTitle>
                <CardDescription>Manuscript in Preparation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Multi-center validation comparing AI system performance against expert radiologist interpretations across diverse LMIC healthcare settings.
                </p>
                <Button size="sm" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg text-muted-foreground text-pretty">Have questions about our research? Interested in collaboration? Get in touch with our team.</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Credits */}
      <section id="credits" className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-lg font-semibold mb-3">Image credits</h2>
          <p className="text-sm text-muted-foreground mb-4">
            All medical images are openly licensed files from Wikimedia Commons, used here as demo data. Patient details shown in the platform are fictional.
          </p>
          <ul className="grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
            {[...SAMPLE_IMAGES, ...SITE_IMAGES]
              .filter((img, i, arr) => arr.findIndex((x) => x.source === img.source) === i)
              .map((img) => (
                <li key={img.src}>
                  <a href={img.source} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                    {decodeURIComponent(img.source.split("File:")[1]).replace(/_/g, " ")}
                  </a>{" "}
                  — {img.credit}
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-semibold text-lg mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span>Stroke AI Study</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Advancing stroke detection and care through artificial intelligence research.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  ["/#about", "About"],
                  ["/#publications", "Publications"],
                  ["/#contact", "Contact"],
                  ["/#credits", "Image credits"],
                  ["/login", "Login"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="hover:text-foreground transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Research Ethics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This study has been approved by institutional review boards and follows all ethical guidelines for medical research.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Stroke AI Research Study. Demo build with simulated data.</p>
          </div>
        </div>
      </footer>

      <Dialog open={!!citation} onOpenChange={(o) => !o && setCitation(null)}>
        <DialogContent>
          {citation && (
            <>
              <DialogHeader>
                <DialogTitle>{citation.title}</DialogTitle>
                <DialogDescription>{citation.venue}</DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed">{citation.abstract}</p>
              <div className="rounded-md bg-muted p-3 font-mono text-xs">
                Stroke AI Study Group. {citation.title}. {citation.venue.split(" • ")[0]}. {citation.year}. doi:{citation.doi}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(`Stroke AI Study Group. ${citation.title}. ${citation.year}. doi:${citation.doi}`)
                  toast.success("Citation copied")
                }}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy citation
              </Button>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> DOIs on this demo site are placeholders.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

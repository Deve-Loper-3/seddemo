import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Globe, Users, FileText, ArrowRight, Download, ExternalLink } from "lucide-react"
import { ContactForm } from "@/components/contact-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            AI-Powered Medical Research
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            Computer-aided Detection and Classification of Ischemic Strokes from MRI Images in LMIC
          </h1>

          <p className="text-xl text-muted-foreground mb-4 text-balance">A Retrospective Cohort Study</p>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            This groundbreaking project explores the use of artificial intelligence for early detection and
            classification of ischemic strokes from MRI images, with a focus on improving healthcare access and outcomes
            in low- and middle-income countries (LMIC).
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base">
              <a href="#about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
              <a href="#publications">View Publications</a>
            </Button>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About the Study</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Understanding the critical need for accessible stroke detection technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Driven Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced machine learning algorithms analyze MRI scans to identify and classify ischemic stroke
                  patterns with high accuracy, supporting clinical decision-making.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle>LMIC Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Stroke is a leading cause of death and disability worldwide. In LMIC settings, limited access to
                  specialists makes early detection challenging—our AI aims to bridge this gap.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Collaborative Research</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  This study brings together leading institutions and researchers in neurology, radiology, and
                  artificial intelligence to advance stroke care globally.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Research Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-lg">Background</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ischemic stroke accounts for approximately 87% of all strokes and requires rapid diagnosis for
                  effective treatment. However, many LMIC healthcare systems face shortages of trained radiologists and
                  neurologists, leading to delayed or missed diagnoses. This retrospective cohort study investigates
                  whether AI-powered computer-aided detection systems can accurately identify and classify ischemic
                  strokes from MRI images in resource-limited settings.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg">Key Objectives</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                  <li>Develop and validate deep learning models for automated stroke detection from MRI scans</li>
                  <li>
                    Assess the accuracy and reliability of AI systems compared to expert radiologist interpretation
                  </li>
                  <li>Evaluate the feasibility of deploying these tools in LMIC healthcare facilities</li>
                  <li>Identify barriers and opportunities for AI integration in resource-constrained environments</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg">Collaborating Institutions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This study is a collaborative effort between leading medical institutions, including university
                  hospitals, research centers in neurology and radiology, and AI research labs. Our multidisciplinary
                  team includes neurologists, radiologists, data scientists, and public health experts committed to
                  improving stroke outcomes worldwide.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Publications Section */}
      <section id="publications" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Publications & Research Outputs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Explore our published research, conference presentations, and ongoing findings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">2024</span>
                </div>
                <CardTitle className="mt-4">Deep Learning Approaches for Ischemic Stroke Detection</CardTitle>
                <CardDescription>Journal of Medical Imaging and AI • Vol. 12, Issue 3</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  A comprehensive analysis of convolutional neural network architectures for automated detection of
                  acute ischemic stroke from diffusion-weighted MRI sequences.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    DOI
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">2024</span>
                </div>
                <CardTitle className="mt-4">AI-Assisted Stroke Diagnosis in Resource-Limited Settings</CardTitle>
                <CardDescription>International Conference on Medical AI • Poster Presentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Preliminary results from our retrospective cohort study demonstrating the feasibility and accuracy of
                  AI-powered stroke detection in LMIC healthcare facilities.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Poster
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abstract
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">2023</span>
                </div>
                <CardTitle className="mt-4">MRI-Based Stroke Classification Using Transfer Learning</CardTitle>
                <CardDescription>Neuroradiology Research Quarterly • Vol. 45, Issue 2</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Evaluation of transfer learning techniques for improving stroke subtype classification accuracy with
                  limited training datasets.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    DOI
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                  Multi-center validation comparing AI system performance against expert radiologist interpretations
                  across diverse LMIC healthcare settings.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Have questions about our research? Interested in collaboration? Get in touch with our team.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ContactForm />
            </CardContent>
          </Card>
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advancing stroke detection and care through artificial intelligence research.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/#about" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/#publications" className="hover:text-foreground transition-colors">
                    Publications
                  </a>
                </li>
                <li>
                  <a href="/#contact" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-foreground transition-colors">
                    Login
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Research Ethics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This study has been approved by institutional review boards and follows all ethical guidelines for
                medical research.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Stroke AI Research Study. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

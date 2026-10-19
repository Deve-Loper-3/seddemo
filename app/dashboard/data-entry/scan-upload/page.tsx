"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Brain, Upload, CheckCircle, Clock, FileImage } from "lucide-react"

const RECENT_UPLOADS = [
  {
    id: "UP-2024-089",
    patientId: "PT-8827",
    fileName: "MRI_DWI_20240115_001.dcm",
    scanType: "DWI/ADC",
    fileSize: "24.3 MB",
    status: "processed",
    uploadDate: "2024-01-15 14:23",
  },
  {
    id: "UP-2024-088",
    patientId: "PT-8826",
    fileName: "MRI_FLAIR_20240115_002.dcm",
    scanType: "FLAIR",
    fileSize: "18.7 MB",
    status: "processing",
    uploadDate: "2024-01-15 13:45",
  },
  {
    id: "UP-2024-087",
    patientId: "PT-8825",
    fileName: "MRI_T2_20240114_003.dcm",
    scanType: "T2-weighted",
    fileSize: "21.2 MB",
    status: "processed",
    uploadDate: "2024-01-14 16:12",
  },
  {
    id: "UP-2024-086",
    patientId: "PT-8824",
    fileName: "MRI_DWI_20240114_004.dcm",
    scanType: "DWI/ADC",
    fileSize: "26.8 MB",
    status: "processed",
    uploadDate: "2024-01-14 15:30",
  },
]

export default function ScanUploadPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "data-entry") {
      router.push("/login")
    }
  }, [router])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    alert("Files uploaded successfully!")
  }

  const processedScans = RECENT_UPLOADS.filter((u) => u.status === "processed").length
  const processingScans = RECENT_UPLOADS.filter((u) => u.status === "processing").length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/data-entry">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Scan Upload</h1>
        </div>
        <p className="text-muted-foreground mb-8">Upload MRI images to the system</p>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">47</div>
                  <div className="text-sm text-muted-foreground">Uploads Today</div>
                </div>
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{processedScans}</div>
                  <div className="text-sm text-muted-foreground">Processed</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{processingScans}</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload MRI Scans</CardTitle>
            <CardDescription>Drag and drop DICOM files or click to browse</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileImage className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <div className="text-lg font-medium mb-2">Drop DICOM files here</div>
              <div className="text-sm text-muted-foreground mb-4">or click to browse your computer</div>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>
              <div className="text-xs text-muted-foreground mt-4">Supported formats: .dcm, .dicom (Max 100MB)</div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Recently uploaded MRI scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_UPLOADS.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <FileImage className="h-10 w-10 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium mb-1">{upload.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {upload.patientId} • {upload.scanType} • {upload.fileSize}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{upload.uploadDate}</div>
                    </div>
                  </div>
                  <Badge variant={upload.status === "processed" ? "default" : "secondary"}>
                    {upload.status === "processed" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processed
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Processing
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

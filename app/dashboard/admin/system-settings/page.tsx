"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Settings, Save } from "lucide-react"

export default function SystemSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    systemName: "Stroke AI Research Platform",
    maxUploadSize: "100",
    sessionTimeout: "60",
    aiConfidenceThreshold: "0.75",
    emailNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
  })

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole")
    if (storedRole !== "admin") {
      router.push("/login")
    }
  }, [router])

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">System Settings</h1>
        </div>
        <p className="text-muted-foreground mb-8">Configure system parameters</p>

        {/* General Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
              <Input
                id="maxUploadSize"
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Model Settings</CardTitle>
            <CardDescription>Configure AI detection parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiThreshold">AI Confidence Threshold</Label>
              <Input
                id="aiThreshold"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.aiConfidenceThreshold}
                onChange={(e) => setSettings({ ...settings, aiConfidenceThreshold: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Minimum confidence score (0-1) for AI predictions to be flagged
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>Enable or disable system features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Send email alerts for important events</div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="h-5 w-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Automatic Backup</div>
                <div className="text-sm text-muted-foreground">Daily automated database backups</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                className="h-5 w-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-sm text-muted-foreground">Restrict system access for maintenance</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-5 w-5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}

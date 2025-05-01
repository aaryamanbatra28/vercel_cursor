"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, CreditCard, Database, Key, Lock, Save, Settings2, Sparkles, User, Users } from "lucide-react"

export default function SettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoJournals, setAutoJournals] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
          <div className="flex gap-3">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-1">
                <Button variant="ghost" className="justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Building className="mr-2 h-4 w-4" />
                  Organization
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Team Members
                </Button>
                <Button variant="ghost" className="justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Button>
                <Button variant="ghost" className="justify-start bg-primary/10 text-primary">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Preferences
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Integrations
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Lock className="mr-2 h-4 w-4" />
                  Security
                </Button>
              </nav>
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure how AI assists with your financial tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
                    <p className="text-sm text-muted-foreground">
                      Use AI to help with financial analysis and suggestions
                    </p>
                  </div>
                  <Switch id="ai-enabled" checked={aiEnabled} onCheckedChange={setAiEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-journals">Automatic Journal Entries</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to automatically generate journal entries from transactions
                    </p>
                  </div>
                  <Switch
                    id="auto-journals"
                    checked={autoJournals}
                    onCheckedChange={setAutoJournals}
                    disabled={!aiEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select defaultValue="gpt4">
                    <SelectTrigger id="ai-model" disabled={!aiEnabled}>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude">Claude 3 Opus</SelectItem>
                      <SelectItem value="custom">Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="confidence-threshold"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="w-full"
                      disabled={!aiEnabled}
                    />
                    <span className="text-sm font-medium">80%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI will only suggest entries when confidence is above this threshold
                  </p>
                </div>

                <div className="pt-4">
                  <div className="rounded-md border p-4 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold">AI Training Status</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your AI assistant has been trained on 6 months of your financial data. Last training: April
                          15, 2025.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          Retrain AI Model
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chart of Accounts</CardTitle>
                <CardDescription>Configure your accounting structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accounting-standard">Accounting Standard</Label>
                  <Select defaultValue="gaap">
                    <SelectTrigger id="accounting-standard">
                      <SelectValue placeholder="Select accounting standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gaap">US GAAP</SelectItem>
                      <SelectItem value="ifrs">IFRS</SelectItem>
                      <SelectItem value="aspe">ASPE (Canada)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscal-year">Fiscal Year End</Label>
                  <Select defaultValue="dec">
                    <SelectTrigger id="fiscal-year">
                      <SelectValue placeholder="Select fiscal year end" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan">January 31</SelectItem>
                      <SelectItem value="feb">February 28/29</SelectItem>
                      <SelectItem value="mar">March 31</SelectItem>
                      <SelectItem value="apr">April 30</SelectItem>
                      <SelectItem value="may">May 31</SelectItem>
                      <SelectItem value="jun">June 30</SelectItem>
                      <SelectItem value="jul">July 31</SelectItem>
                      <SelectItem value="aug">August 31</SelectItem>
                      <SelectItem value="sep">September 30</SelectItem>
                      <SelectItem value="oct">October 31</SelectItem>
                      <SelectItem value="nov">November 30</SelectItem>
                      <SelectItem value="dec">December 31</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button variant="outline">Manage Chart of Accounts</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize the appearance of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                  </div>
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select default currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                      <SelectItem value="aud">AUD ($)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

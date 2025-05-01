"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ArrowUpRight,
  BarChart3,
  Download,
  TrendingUp,
  Mail,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock employee data
const employees = [
  { id: "emp1", name: "Jane Smith", email: "jane.smith@company.com", department: "Marketing", avatar: "JS" },
  { id: "emp2", name: "Michael Johnson", email: "michael.johnson@company.com", department: "Finance", avatar: "MJ" },
  { id: "emp3", name: "Sarah Williams", email: "sarah.williams@company.com", department: "Sales", avatar: "SW" },
  { id: "emp4", name: "David Brown", email: "david.brown@company.com", department: "Operations", avatar: "DB" },
  { id: "emp5", name: "Emily Davis", email: "emily.davis@company.com", department: "Technology", avatar: "ED" },
]

// Mock variance data with feedback status
const varianceData = [
  {
    id: "var1",
    category: "Advertising Expense",
    department: "Marketing",
    actual: 32000,
    forecast: 20000,
    variance: -12000,
    variancePercent: -60,
    status: "unfavorable",
    feedback: {
      status: "received",
      employee: employees[0],
      message:
        "We increased our Google Ads budget for the new product launch. This was approved by the CMO as part of our Q2 growth strategy. The increased spend has resulted in a 25% increase in qualified leads.",
      sentAt: "2025-04-18T10:30:00Z",
      respondedAt: "2025-04-19T14:45:00Z",
    },
    aiAnalysis: {
      original:
        "Advertising expenses are $12,000 (60%) over budget. This is primarily due to increased Google Ads spending for the new product launch. While this exceeds the monthly allocation, it aligns with the quarterly marketing plan that anticipated front-loading ad spend.",
      updated:
        "Advertising expenses are $12,000 (60%) over budget due to a strategic decision to increase Google Ads spending for the new product launch, approved by the CMO as part of the Q2 growth strategy. This investment has yielded positive results with a 25% increase in qualified leads. While this exceeds the monthly allocation, the ROI appears to justify the increased spend, and it aligns with the quarterly marketing plan that anticipated front-loading ad spend.",
    },
  },
  {
    id: "var2",
    category: "Cloud Infrastructure",
    department: "Technology",
    actual: 46500,
    forecast: 55000,
    variance: 8500,
    variancePercent: 15.5,
    status: "favorable",
    feedback: {
      status: "pending",
      employee: employees[4],
      message: "We'd like your input on the lower than expected cloud infrastructure costs this month.",
      sentAt: "2025-04-20T09:15:00Z",
    },
    aiAnalysis: {
      original:
        "Cloud infrastructure costs are $8,500 (15%) under budget despite increased user traffic. The recent migration to serverless architecture and implementation of auto-scaling policies has yielded greater efficiency than initially projected.",
      updated: null,
    },
  },
  {
    id: "var3",
    category: "Enterprise Revenue",
    department: "Sales",
    actual: 338500,
    forecast: 300000,
    variance: 38500,
    variancePercent: 12.8,
    status: "favorable",
    feedback: {
      status: "none",
    },
    aiAnalysis: {
      original:
        "Enterprise subscription revenue exceeded forecast by $38,500 (12.8%). This is primarily due to three new enterprise customers onboarded in late March, plus higher-than-expected expansion revenue from existing customers.",
      updated: null,
    },
  },
]

export default function AnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("april")
  const [selectedVariance, setSelectedVariance] = useState<string | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  // Get the selected variance data
  const selectedVarianceData = varianceData.find((v) => v.id === selectedVariance)

  // Handle employee selection
  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId))
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId])
    }
  }

  // Handle sending email
  const handleSendEmail = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to send the email.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Simulate sending email
    setTimeout(() => {
      setIsSending(false)
      setShowEmailDialog(false)

      toast({
        title: "Feedback request sent",
        description: `Email sent to ${selectedEmployees.length} employee(s).`,
      })

      // Reset form
      setSelectedEmployees([])
      setEmailSubject("")
      setEmailMessage("")
    }, 1500)
  }

  // Handle reanalyzing with LLM
  const handleReanalyze = () => {
    if (
      !selectedVarianceData ||
      !selectedVarianceData.feedback ||
      selectedVarianceData.feedback.status !== "received"
    ) {
      return
    }

    setIsReanalyzing(true)

    // Simulate LLM processing
    setTimeout(() => {
      setIsReanalyzing(false)
      setShowFeedbackDialog(false)

      toast({
        title: "Analysis updated",
        description: "The variance analysis has been updated based on employee feedback.",
      })
    }, 2000)
  }

  // Prepare email dialog when a variance is selected
  const prepareEmailDialog = (varianceId: string) => {
    const variance = varianceData.find((v) => v.id === varianceId)
    if (!variance) return

    setSelectedVariance(varianceId)

    // Pre-fill email subject and message
    setEmailSubject(`Input needed: ${variance.category} variance analysis`)
    setEmailMessage(
      `We've identified a ${Math.abs(variance.variancePercent)}% ${variance.status} variance in ${variance.category}.\n\n` +
        `Our current analysis suggests: ${variance.aiAnalysis.original}\n\n` +
        `Could you please provide additional context or reasons for this variance? Your insights will help us improve our financial analysis.`,
    )

    // Pre-select department employee
    const departmentEmployee = employees.find((e) => e.department === variance.department)
    if (departmentEmployee) {
      setSelectedEmployees([departmentEmployee.id])
    } else {
      setSelectedEmployees([])
    }

    setShowEmailDialog(true)
  }

  // Show feedback dialog
  const showFeedback = (varianceId: string) => {
    setSelectedVariance(varianceId)
    setShowFeedbackDialog(true)
  }

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Variance Analysis</h1>
            <p className="text-muted-foreground">Compare actual performance against forecasts with AI insights</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="april">April 2025</SelectItem>
                <SelectItem value="march">March 2025</SelectItem>
                <SelectItem value="february">February 2025</SelectItem>
                <SelectItem value="january">January 2025</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Variance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">+$45,000</div>
                    <div className="flex items-center text-emerald-500 font-medium text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      3.8%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Above forecast</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Expense Variance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">-$12,500</div>
                    <div className="flex items-center text-rose-500 font-medium text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      1.4%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Above forecast</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit Variance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">+$32,500</div>
                    <div className="flex items-center text-emerald-500 font-medium text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      9.7%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Above forecast</p>
                </CardContent>
              </Card>
            </div>

            {/* Variance Analysis Table */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Significant Variances</CardTitle>
                <CardDescription>Key variances requiring attention or explanation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-right">Forecast</div>
                    <div className="col-span-1 text-right">Actual</div>
                    <div className="col-span-1 text-right">Variance</div>
                    <div className="col-span-1 text-right">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {varianceData.map((variance) => (
                    <div key={variance.id} className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                      <div className="col-span-2">{variance.category}</div>
                      <div className="col-span-1 text-right">${variance.forecast.toLocaleString()}</div>
                      <div className="col-span-1 text-right">${variance.actual.toLocaleString()}</div>
                      <div
                        className="col-span-1 text-right"
                        className={
                          variance.status === "favorable"
                            ? "col-span-1 text-right text-emerald-600"
                            : "col-span-1 text-right text-rose-600"
                        }
                      >
                        {variance.variance > 0 ? "+" : ""}
                        {variance.variance.toLocaleString()} ({Math.abs(variance.variancePercent)}%)
                      </div>
                      <div className="col-span-1 text-right">
                        <Badge
                          className={
                            variance.status === "favorable"
                              ? "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20"
                              : "bg-rose-500/20 text-rose-700 hover:bg-rose-500/20"
                          }
                        >
                          {variance.status === "favorable" ? "Favorable" : "Unfavorable"}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-right flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => prepareEmailDialog(variance.id)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Request feedback</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {variance.feedback && variance.feedback.status !== "none" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => showFeedback(variance.id)}
                                >
                                  <Badge
                                    className="h-2 w-2 absolute top-0 right-0 p-0"
                                    variant={variance.feedback.status === "received" ? "default" : "outline"}
                                  />
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{variance.feedback.status === "pending" ? "Feedback requested" : "View feedback"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🧠</span> AI Variance Analysis
                </CardTitle>
                <CardDescription>Key insights based on variance between actual and forecast</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Enterprise Revenue Outperformance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enterprise subscription revenue exceeded forecast by $38,500 (12.8%). This is primarily due to
                      three new enterprise customers onboarded in late March, plus higher-than-expected expansion
                      revenue from existing customers. The sales team's new account-based marketing approach appears to
                      be yielding results ahead of schedule.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-rose-500/20 p-2">
                    <TrendingUp className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold flex items-center">
                      Advertising Expense Variance
                      <Badge className="ml-2 bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">Updated</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{varianceData[0].aiAnalysis.updated}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Cloud Infrastructure Savings</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cloud infrastructure costs are $8,500 (15%) under budget despite increased user traffic. The
                      recent migration to serverless architecture and implementation of auto-scaling policies has
                      yielded greater efficiency than initially projected. Consider reallocating some of these savings
                      to accelerate the database optimization project.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Comprehensive Analysis
                </Button>
              </CardFooter>
            </Card>

            {/* Variance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Variance Breakdown</CardTitle>
                <CardDescription>Line-by-line comparison of actual vs. forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-right">Forecast</div>
                    <div className="col-span-1 text-right">Actual</div>
                    <div className="col-span-1 text-right">Variance ($)</div>
                    <div className="col-span-1 text-right">Variance (%)</div>
                    <div className="col-span-1 text-right">Status</div>
                  </div>

                  {/* Revenue Section */}
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="font-semibold">Revenue</div>
                  </div>

                  <div className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">Enterprise Subscriptions</div>
                    <div className="col-span-1 text-right">$300,000</div>
                    <div className="col-span-1 text-right">$338,500</div>
                    <div className="col-span-1 text-right text-emerald-600">+$38,500</div>
                    <div className="col-span-1 text-right text-emerald-600">+12.8%</div>
                    <div className="col-span-1 text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">Favorable</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">SMB Subscriptions</div>
                    <div className="col-span-1 text-right">$450,000</div>
                    <div className="col-span-1 text-right">$456,500</div>
                    <div className="col-span-1 text-right text-emerald-600">+$6,500</div>
                    <div className="col-span-1 text-right text-emerald-600">+1.4%</div>
                    <div className="col-span-1 text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">Favorable</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">Professional Services</div>
                    <div className="col-span-1 text-right">$150,000</div>
                    <div className="col-span-1 text-right">$150,000</div>
                    <div className="col-span-1 text-right">$0</div>
                    <div className="col-span-1 text-right">0.0%</div>
                    <div className="col-span-1 text-right">
                      <Badge className="bg-muted hover:bg-muted">On Target</Badge>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="font-semibold">Expenses</div>
                  </div>

                  <div className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">Salaries & Benefits</div>
                    <div className="col-span-1 text-right">$450,000</div>
                    <div className="col-span-1 text-right">$450,000</div>
                    <div className="col-span-1 text-right">$0</div>
                    <div className="col-span-1 text-right">0.0%</div>
                    <div className="col-span-1 text-right">
                      <Badge className="bg-muted hover:bg-muted">On Target</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">Advertising & Marketing</div>
                    <div className="col-span-1 text-right">$20,000</div>
                    <div className="col-span-1 text-right">$32,000</div>
                    <div className="col-span-1 text-right text-rose-600">-$12,000</div>
                    <div className="col-span-1 text-right text-rose-600">-60.0%</div>
                    <div className="col-span-1 text-right">
                      <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/20">Unfavorable</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">Cloud Infrastructure</div>
                    <div className="col-span-1 text-right">$55,000</div>
                    <div className="col-span-1 text-right">$46,500</div>
                    <div className="col-span-1 text-right text-emerald-600">+$8,500</div>
                    <div className="col-span-1 text-right text-emerald-600">+15.5%</div>
                    <div className="col-span-1 text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">Favorable</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Detailed breakdown of revenue streams and variances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a revenue category to view detailed analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
                <CardDescription>Detailed breakdown of expense categories and variances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select an expense category to view detailed analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profitability" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
                <CardDescription>Detailed breakdown of profitability metrics and variances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a profitability metric to view detailed analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Request Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Feedback on Variance</DialogTitle>
            <DialogDescription>Send an email to request input on the reasons for this variance.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employees">Select Recipients</Label>
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                    />
                    <Label htmlFor={`employee-${employee.id}`} className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{employee.avatar}</AvatarFallback>
                      </Avatar>
                      <span>{employee.name}</span>
                      <span className="text-xs text-muted-foreground">({employee.department})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Enter your message"
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback View Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Variance Feedback</DialogTitle>
            <DialogDescription>
              {selectedVarianceData?.feedback?.status === "pending"
                ? "Feedback has been requested but not yet received."
                : "Review feedback and update analysis."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedVarianceData?.feedback?.status === "pending" ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Awaiting Response</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Feedback request was sent to {selectedVarianceData?.feedback?.employee?.name} on{" "}
                  {new Date(selectedVarianceData?.feedback?.sentAt || "").toLocaleDateString()}.
                </p>
                <Button variant="outline" size="sm">
                  Send Reminder
                </Button>
              </div>
            ) : selectedVarianceData?.feedback?.status === "received" ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>{selectedVarianceData?.feedback?.employee?.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedVarianceData?.feedback?.employee?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedVarianceData?.feedback?.employee?.department}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedVarianceData?.feedback?.respondedAt || "").toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 text-sm">{selectedVarianceData?.feedback?.message}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Original AI Analysis</Label>
                  <div className="p-3 bg-muted/20 rounded-md text-sm">{selectedVarianceData?.aiAnalysis?.original}</div>
                </div>

                {selectedVarianceData?.aiAnalysis?.updated ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Updated AI Analysis</Label>
                      <Badge className="ml-2 bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">Updated</Badge>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-md text-sm border-primary/20 border">
                      {selectedVarianceData?.aiAnalysis?.updated}
                    </div>
                  </div>
                ) : (
                  <Button className="w-full" onClick={handleReanalyze} disabled={isReanalyzing}>
                    {isReanalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Reanalyze with LLM
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No Feedback Available</h3>
                <p className="text-sm text-muted-foreground">No feedback has been requested for this variance.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

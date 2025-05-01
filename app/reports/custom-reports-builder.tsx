"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  FileUp,
  Eye,
  Move,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Printer,
  FilePlus2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

// Mock data for available metrics
const availableMetrics = [
  {
    id: "revenue-total",
    name: "Total Revenue",
    description: "Total revenue for the selected period",
    category: "income",
    type: "number",
    format: "currency",
    value: 945000,
    change: 8.2,
    visualization: "number",
  },
  {
    id: "expenses-total",
    name: "Total Expenses",
    description: "Total expenses for the selected period",
    category: "income",
    type: "number",
    format: "currency",
    value: 576500,
    change: 4.7,
    visualization: "number",
  },
  {
    id: "net-income",
    name: "Net Income",
    description: "Net income for the selected period",
    category: "income",
    type: "number",
    format: "currency",
    value: 368500,
    change: 12.3,
    visualization: "number",
  },
  {
    id: "revenue-breakdown",
    name: "Revenue Breakdown",
    description: "Breakdown of revenue by source",
    category: "income",
    type: "chart",
    format: "pie",
    data: [
      { name: "Enterprise", value: 338500, percentage: 36 },
      { name: "SMB", value: 456500, percentage: 48 },
      { name: "Services", value: 150000, percentage: 16 },
    ],
    visualization: "pie",
  },
  {
    id: "expense-breakdown",
    name: "Expense Breakdown",
    description: "Breakdown of expenses by category",
    category: "income",
    type: "chart",
    format: "bar",
    data: [
      { name: "Salaries", value: 450000, percentage: 78 },
      { name: "Cloud", value: 46500, percentage: 8 },
      { name: "Advertising", value: 32000, percentage: 6 },
      { name: "Rent", value: 25000, percentage: 4 },
      { name: "Other", value: 23000, percentage: 4 },
    ],
    visualization: "bar",
  },
  {
    id: "cash-balance",
    name: "Cash Balance",
    description: "Cash and cash equivalents balance",
    category: "balance",
    type: "number",
    format: "currency",
    value: 1250000,
    change: 38.2,
    visualization: "number",
  },
  {
    id: "accounts-receivable",
    name: "Accounts Receivable",
    description: "Total accounts receivable",
    category: "balance",
    type: "number",
    format: "currency",
    value: 450000,
    change: 5.3,
    visualization: "number",
  },
  {
    id: "total-assets",
    name: "Total Assets",
    description: "Total assets value",
    category: "balance",
    type: "number",
    format: "currency",
    value: 2325000,
    change: 12.8,
    visualization: "number",
  },
  {
    id: "total-liabilities",
    name: "Total Liabilities",
    description: "Total liabilities value",
    category: "balance",
    type: "number",
    format: "currency",
    value: 560000,
    change: -2.1,
    visualization: "number",
  },
  {
    id: "operating-cash-flow",
    name: "Operating Cash Flow",
    description: "Net cash from operating activities",
    category: "cashflow",
    type: "number",
    format: "currency",
    value: 426000,
    change: 15.2,
    visualization: "number",
  },
  {
    id: "investing-cash-flow",
    name: "Investing Cash Flow",
    description: "Net cash used in investing activities",
    category: "cashflow",
    type: "number",
    format: "currency",
    value: -25000,
    change: -10.5,
    visualization: "number",
  },
  {
    id: "mrr-kpi",
    name: "Monthly Recurring Revenue",
    description: "KPI: Monthly recurring revenue",
    category: "kpi",
    type: "kpi",
    format: "currency",
    value: 945000,
    target: 1000000,
    progress: 94.5,
    status: "on-track",
    visualization: "kpi",
  },
  {
    id: "cac-kpi",
    name: "Customer Acquisition Cost",
    description: "KPI: Average cost to acquire a new customer",
    category: "kpi",
    type: "kpi",
    format: "currency",
    value: 450,
    target: 500,
    progress: 110,
    status: "on-track",
    visualization: "kpi",
  },
  {
    id: "churn-kpi",
    name: "Churn Rate",
    description: "KPI: Percentage of customers who cancel",
    category: "kpi",
    type: "kpi",
    format: "percentage",
    value: 2.5,
    target: 2.0,
    progress: 80,
    status: "at-risk",
    visualization: "kpi",
  },
  {
    id: "revenue-trend",
    name: "Revenue Trend",
    description: "Monthly revenue trend for the past 6 months",
    category: "income",
    type: "chart",
    format: "line",
    data: [
      { month: "Nov", value: 820000 },
      { month: "Dec", value: 850000 },
      { month: "Jan", value: 875000 },
      { month: "Feb", value: 890000 },
      { month: "Mar", value: 915000 },
      { month: "Apr", value: 945000 },
    ],
    visualization: "line",
  },
]

// Mock saved report templates
const savedReportTemplates = [
  {
    id: "template-1",
    name: "Executive Summary",
    description: "High-level overview of key financial metrics",
    metrics: ["revenue-total", "expenses-total", "net-income", "revenue-breakdown", "cash-balance"],
    lastModified: "2025-04-15",
  },
  {
    id: "template-2",
    name: "KPI Dashboard",
    description: "Overview of all key performance indicators",
    metrics: ["mrr-kpi", "cac-kpi", "churn-kpi", "revenue-trend"],
    lastModified: "2025-04-10",
  },
  {
    id: "template-3",
    name: "Financial Health",
    description: "Detailed financial health report",
    metrics: [
      "revenue-total",
      "expenses-total",
      "net-income",
      "cash-balance",
      "total-assets",
      "total-liabilities",
      "operating-cash-flow",
    ],
    lastModified: "2025-04-05",
  },
]

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage
const formatPercentage = (value: number) => {
  return `${value}%`
}

// Format value based on format type
const formatValue = (value: number, format: string) => {
  if (format === "currency") {
    return formatCurrency(value)
  } else if (format === "percentage") {
    return formatPercentage(value)
  } else {
    return value.toString()
  }
}

// Get visualization icon
const getVisualizationIcon = (type: string) => {
  switch (type) {
    case "pie":
      return <PieChart className="h-4 w-4" />
    case "bar":
      return <BarChart3 className="h-4 w-4" />
    case "line":
      return <LineChart className="h-4 w-4" />
    case "table":
      return <Table className="h-4 w-4" />
    case "number":
      return <FileSpreadsheet className="h-4 w-4" />
    case "kpi":
      return <Sparkles className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

// Get category badge color
const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "income":
      return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/20"
    case "balance":
      return "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20"
    case "cashflow":
      return "bg-purple-500/20 text-purple-700 hover:bg-purple-500/20"
    case "kpi":
      return "bg-amber-500/20 text-amber-700 hover:bg-amber-500/20"
    default:
      return "bg-slate-500/20 text-slate-700 hover:bg-slate-500/20"
  }
}

// Get category display name
const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case "income":
      return "Income Statement"
    case "balance":
      return "Balance Sheet"
    case "cashflow":
      return "Cash Flow"
    case "kpi":
      return "KPI"
    default:
      return category
  }
}

interface CustomReportsBuilderProps {
  selectedPeriod: string
}

// Using default export instead of named export
export default function CustomReportsBuilder({ selectedPeriod }: CustomReportsBuilderProps) {
  const [reportName, setReportName] = useState("New Custom Report")
  const [reportDescription, setReportDescription] = useState(
    "Custom report created on " + new Date().toLocaleDateString(),
  )
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [includeAiInsights, setIncludeAiInsights] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTables, setIncludeTables] = useState(true)
  const [reportLayout, setReportLayout] = useState("standard")
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter metrics based on category and search term
  const filteredMetrics = availableMetrics.filter((metric) => {
    const matchesCategory = activeCategory === "all" || metric.category === activeCategory
    const matchesSearch =
      searchTerm === "" ||
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Handle adding a metric to the report
  const addMetric = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics([...selectedMetrics, metricId])
      toast({
        title: "Metric Added",
        description: "The metric has been added to your report.",
      })
    }
  }

  // Handle removing a metric from the report
  const removeMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter((id) => id !== metricId))
    toast({
      title: "Metric Removed",
      description: "The metric has been removed from your report.",
    })
  }

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(selectedMetrics)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedMetrics(items)
  }

  // Generate AI insights
  const generateAiInsights = () => {
    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to generate insights.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingInsights(true)

    // Simulate API call to generate insights
    setTimeout(() => {
      const insights = `
Based on the selected metrics, here are some key insights:

1. **Revenue Growth**: Total revenue has increased by 8.2% compared to the previous period, primarily driven by enterprise subscriptions which grew by 12.8%.

2. **Profitability**: Net income has increased by 12.3%, outpacing revenue growth, which indicates improved operational efficiency. This is supported by the reduction in cloud infrastructure costs.

3. **Cash Position**: The cash balance has increased significantly by 38.2%, providing a strong liquidity position for future investments or to weather potential downturns.

4. **KPI Performance**: Monthly Recurring Revenue (MRR) is at 94.5% of the target, showing strong progress. However, the Churn Rate is slightly above target at 2.5% vs 2.0%, which may require attention.

5. **Recommendation**: Consider allocating resources to address the slightly elevated churn rate, possibly through enhanced customer success initiatives or product improvements targeted at retention.
      `

      setAiInsights(insights)
      setIsGeneratingInsights(false)

      toast({
        title: "AI Insights Generated",
        description: "AI-powered insights have been generated for your report.",
      })
    }, 3000)
  }

  // Generate PDF report
  const generatePdfReport = () => {
    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to generate a report.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPdf(true)

    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPdf(false)
      toast({
        title: "PDF Report Generated",
        description: "Your custom report has been generated and is ready to download.",
      })
    }, 3000)
  }

  // Save report template
  const saveReportTemplate = () => {
    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to save as a template.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Report Template Saved",
      description: `The report template "${reportName}" has been saved.`,
    })

    setShowSaveDialog(false)
  }

  // Load report template
  const loadReportTemplate = (templateId: string) => {
    const template = savedReportTemplates.find((t) => t.id === templateId)
    if (template) {
      setReportName(template.name)
      setReportDescription(template.description)
      setSelectedMetrics(template.metrics)

      toast({
        title: "Report Template Loaded",
        description: `The report template "${template.name}" has been loaded.`,
      })

      setShowLoadDialog(false)
    }
  }

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Clear report
  const clearReport = () => {
    setSelectedMetrics([])
    setReportName("New Custom Report")
    setReportDescription("Custom report created on " + new Date().toLocaleDateString())
    setAiInsights("")

    toast({
      title: "Report Cleared",
      description: "All metrics have been removed from your report.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{reportName}</h2>
          <p className="text-muted-foreground">{reportDescription}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowLoadDialog(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Load Template
          </Button>
          <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
          <Button onClick={generatePdfReport} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Metrics</CardTitle>
              <CardDescription>Select metrics to include in your custom report</CardDescription>
              <div className="mt-2">
                <Input
                  type="search"
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" onValueChange={setActiveCategory}>
                <div className="px-6 pb-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="balance">Balance</TabsTrigger>
                    <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                    <TabsTrigger value="kpi">KPIs</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="m-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredMetrics.length > 0 ? (
                      <div className="divide-y">
                        {filteredMetrics.map((metric) => (
                          <div key={metric.id} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{metric.name}</span>
                                  <Badge className={getCategoryBadgeColor(metric.category)}>
                                    {getCategoryDisplayName(metric.category)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => addMetric(metric.id)}
                                disabled={selectedMetrics.includes(metric.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                {getVisualizationIcon(metric.visualization)}
                                <span className="ml-1 capitalize">{metric.visualization}</span>
                              </div>
                              {metric.type === "number" && (
                                <div className="text-xs font-medium">{formatValue(metric.value, metric.format)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No metrics found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="income" className="m-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredMetrics.length > 0 ? (
                      <div className="divide-y">
                        {filteredMetrics.map((metric) => (
                          <div key={metric.id} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => addMetric(metric.id)}
                                disabled={selectedMetrics.includes(metric.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                {getVisualizationIcon(metric.visualization)}
                                <span className="ml-1 capitalize">{metric.visualization}</span>
                              </div>
                              {metric.type === "number" && (
                                <div className="text-xs font-medium">{formatValue(metric.value, metric.format)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No income metrics found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="balance" className="m-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredMetrics.length > 0 ? (
                      <div className="divide-y">
                        {filteredMetrics.map((metric) => (
                          <div key={metric.id} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => addMetric(metric.id)}
                                disabled={selectedMetrics.includes(metric.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                {getVisualizationIcon(metric.visualization)}
                                <span className="ml-1 capitalize">{metric.visualization}</span>
                              </div>
                              {metric.type === "number" && (
                                <div className="text-xs font-medium">{formatValue(metric.value, metric.format)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No balance sheet metrics found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="cashflow" className="m-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredMetrics.length > 0 ? (
                      <div className="divide-y">
                        {filteredMetrics.map((metric) => (
                          <div key={metric.id} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => addMetric(metric.id)}
                                disabled={selectedMetrics.includes(metric.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                {getVisualizationIcon(metric.visualization)}
                                <span className="ml-1 capitalize">{metric.visualization}</span>
                              </div>
                              {metric.type === "number" && (
                                <div className="text-xs font-medium">{formatValue(metric.value, metric.format)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No cash flow metrics found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="kpi" className="m-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredMetrics.length > 0 ? (
                      <div className="divide-y">
                        {filteredMetrics.map((metric) => (
                          <div key={metric.id} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => addMetric(metric.id)}
                                disabled={selectedMetrics.includes(metric.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                {getVisualizationIcon(metric.visualization)}
                                <span className="ml-1 capitalize">{metric.visualization}</span>
                              </div>
                              {metric.type === "kpi" && (
                                <div className="text-xs font-medium">
                                  {formatValue(metric.value, metric.format)} /{" "}
                                  {formatValue(metric.target, metric.format)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No KPI metrics found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={handleFileUpload}>
                <FileUp className="mr-2 h-4 w-4" />
                Import Metrics
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx,.json"
                onChange={() => {
                  toast({
                    title: "File Uploaded",
                    description: "Your metrics file has been uploaded and processed.",
                  })
                }}
              />
              <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Load Template
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure your report settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Enter report description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-layout">Report Layout</Label>
                <Select value={reportLayout} onValueChange={setReportLayout}>
                  <SelectTrigger id="report-layout">
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="executive">Executive Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="include-ai-insights">Include AI Insights</Label>
                <Switch id="include-ai-insights" checked={includeAiInsights} onCheckedChange={setIncludeAiInsights} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="include-charts">Include Charts</Label>
                <Switch id="include-charts" checked={includeCharts} onCheckedChange={setIncludeCharts} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="include-tables">Include Tables</Label>
                <Switch id="include-tables" checked={includeTables} onCheckedChange={setIncludeTables} />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={generateAiInsights}
                disabled={isGeneratingInsights || selectedMetrics.length === 0}
              >
                {isGeneratingInsights ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Report Builder</CardTitle>
                  <CardDescription>
                    {selectedMetrics.length === 0
                      ? "Add metrics to your report from the available metrics panel"
                      : `${selectedMetrics.length} metric${selectedMetrics.length === 1 ? "" : "s"} selected`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearReport} disabled={selectedMetrics.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedMetrics.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium">No metrics selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select metrics from the available metrics panel to add them to your report.
                    </p>
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="selected-metrics">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 max-h-[500px] overflow-y-auto pr-2"
                      >
                        {selectedMetrics.map((metricId, index) => {
                          const metric = availableMetrics.find((m) => m.id === metricId)
                          if (!metric) return null

                          return (
                            <Draggable key={metricId} draggableId={metricId} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-lg p-4 bg-white"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div {...provided.dragHandleProps}>
                                          <Move className="h-4 w-4 text-muted-foreground cursor-move" />
                                        </div>
                                        <span className="font-medium">{metric.name}</span>
                                        <Badge className={getCategoryBadgeColor(metric.category)}>
                                          {getCategoryDisplayName(metric.category)}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1 ml-6">{metric.description}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="icon" onClick={() => removeMetric(metricId)}>
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </div>
                                  </div>

                                  {showPreview && (
                                    <div className="mt-4 ml-6 border-t pt-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          {getVisualizationIcon(metric.visualization)}
                                          <span className="ml-1 capitalize">{metric.visualization}</span>
                                        </div>
                                      </div>

                                      {metric.visualization === "number" && (
                                        <div className="flex items-center justify-between">
                                          <div className="text-2xl font-bold">
                                            {formatValue(metric.value, metric.format)}
                                          </div>
                                          <div
                                            className={`flex items-center text-sm ${
                                              metric.change > 0 ? "text-emerald-500" : "text-rose-500"
                                            }`}
                                          >
                                            {metric.change > 0 ? (
                                              <TrendingUp className="h-4 w-4 mr-1" />
                                            ) : (
                                              <TrendingDown className="h-4 w-4 mr-1" />
                                            )}
                                            {Math.abs(metric.change)}%
                                          </div>
                                        </div>
                                      )}

                                      {metric.visualization === "kpi" && (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold">
                                              {formatValue(metric.value, metric.format)}
                                            </div>
                                            <div className="text-sm font-medium">
                                              Target: {formatValue(metric.target, metric.format)}
                                            </div>
                                          </div>
                                          <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                              className={`h-2 rounded-full ${
                                                metric.status === "on-track"
                                                  ? "bg-emerald-500"
                                                  : metric.status === "at-risk"
                                                    ? "bg-amber-500"
                                                    : "bg-rose-500"
                                              }`}
                                              style={{ width: `${metric.progress}%` }}
                                            ></div>
                                          </div>
                                          <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{metric.progress}%</span>
                                          </div>
                                        </div>
                                      )}

                                      {metric.visualization === "pie" && (
                                        <div className="flex items-center justify-center">
                                          <div className="h-32 w-32 relative">
                                            <PieChart className="h-full w-full text-muted-foreground" />
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                              <span className="text-sm font-medium">Total</span>
                                              <span className="text-lg font-bold">
                                                {formatCurrency(metric.data.reduce((sum, item) => sum + item.value, 0))}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {metric.visualization === "bar" && (
                                        <div className="h-32 w-full relative">
                                          <BarChart3 className="h-full w-full text-muted-foreground" />
                                        </div>
                                      )}

                                      {metric.visualization === "line" && (
                                        <div className="h-32 w-full relative">
                                          <LineChart className="h-full w-full text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {aiInsights && includeAiInsights && (
                <div className="mt-6 p-4 border rounded-lg bg-primary/5">
                  <h3 className="text-sm font-semibold flex items-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    AI Insights
                  </h3>
                  <div className="text-sm whitespace-pre-line">{aiInsights}</div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowSaveDialog(true)} disabled={selectedMetrics.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                Save as Template
              </Button>
              <Button onClick={generatePdfReport} disabled={isGeneratingPdf || selectedMetrics.length === 0}>
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save Report Template</DialogTitle>
            <DialogDescription>Save your current report configuration as a template for future use.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Name
              </Label>
              <Input
                id="template-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="template-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Metrics</Label>
              <div className="col-span-3 text-sm">
                {selectedMetrics.length} metric{selectedMetrics.length === 1 ? "" : "s"} selected
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveReportTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Load Report Template</DialogTitle>
            <DialogDescription>Select a saved report template to load.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {savedReportTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{template.metrics.length} metrics</span>
                        <span>•</span>
                        <span>Last modified: {template.lastModified}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => loadReportTemplate(template.id)}>
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// First, convert the component to a client component
"use client"

import type React from "react"

// Add these imports at the top of the file
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileSpreadsheet, FileText, Upload, X, RefreshCw } from "lucide-react"

// Replace the existing export default function with this updated version
export default function UploadPage() {
  const router = useRouter()
  const { addDocument, addTransaction } = useData()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedDataType, setSelectedDataType] = useState("bank")
  const [selectedPeriod, setSelectedPeriod] = useState("april")
  const [selectedProcessingLevel, setSelectedProcessingLevel] = useState("full")

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  // Handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Remove file
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles]
    newFiles.splice(index, 1)
    setUploadedFiles(newFiles)
  }

  // Process files
  const handleProcessFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to process.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setProcessingStatus("Uploading files...")

    try {
      // Process each file
      for (const file of uploadedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        setProcessingStatus(`Processing ${file.name}...`)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to process file")
        }

        const data = await response.json()

        // Add document to context
        if (data.document) {
          addDocument(data.document)
        }

        // Add transactions to context
        if (data.analysis && data.analysis.transactions) {
          data.analysis.transactions.forEach((transaction: any) => {
            addTransaction({
              ...transaction,
              documentId: data.document.id,
            })
          })
        }
      }

      toast({
        title: "Processing Complete",
        description: `Successfully processed ${uploadedFiles.length} file(s).`,
      })

      // Clear uploaded files
      setUploadedFiles([])

      // Navigate to journals page if processing was successful
      if (selectedProcessingLevel === "full") {
        router.push("/journals")
      }
    } catch (error) {
      console.error("Error processing files:", error)
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process files",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setProcessingStatus(null)
    }
  }

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Financial Data</h1>
            <p className="text-muted-foreground">Import data from various sources for AI processing</p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="connect">Connect Systems</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Upload Financial Data</CardTitle>
                  <CardDescription>Drag and drop files or click to browse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed rounded-lg p-12 text-center"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Drag files here or click to browse</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports CSV, Excel, PDF bank statements, and QuickBooks exports
                        </p>
                      </div>
                      <Button onClick={() => document.getElementById("file-input")?.click()}>Select Files</Button>
                      <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".csv,.xlsx,.xls,.pdf"
                        multiple
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-500/20 p-2">
                            {file.name.endsWith(".pdf") ? (
                              <FileText className="h-5 w-5 text-blue-500" />
                            ) : (
                              <FileSpreadsheet className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB •
                              {file.name.endsWith(".pdf")
                                ? " PDF Document"
                                : file.name.endsWith(".csv")
                                  ? " CSV Spreadsheet"
                                  : " Excel Spreadsheet"}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleProcessFiles}
                    disabled={isUploading || uploadedFiles.length === 0}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {processingStatus || "Processing..."}
                      </>
                    ) : (
                      <>
                        Process Files with AI
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Options</CardTitle>
                  <CardDescription>Configure how AI processes your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Data Type</label>
                    <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Statement</SelectItem>
                        <SelectItem value="expense">Expense Report</SelectItem>
                        <SelectItem value="invoice">Invoices</SelectItem>
                        <SelectItem value="journal">Journal Entries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Time Period</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="april">April 2025</SelectItem>
                        <SelectItem value="march">March 2025</SelectItem>
                        <SelectItem value="q1">Q1 2025</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Processing Level</label>
                    <Select value={selectedProcessingLevel} onValueChange={setSelectedProcessingLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select processing level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (Data Extraction Only)</SelectItem>
                        <SelectItem value="standard">Standard (Extraction + Categorization)</SelectItem>
                        <SelectItem value="full">Full (Extraction + Journals + Analysis)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-3">AI Processing Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20">Active</Badge>
                        <span className="text-sm">Automatic Categorization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20">Active</Badge>
                        <span className="text-sm">Journal Entry Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20">Active</Badge>
                        <span className="text-sm">Variance Detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-muted hover:bg-muted">Optional</Badge>
                        <span className="text-sm">Anomaly Detection</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Our AI processes your financial data in three steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <svg
                        className="h-8 w-8 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">1. Upload & Extract</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI extracts all financial data from your uploaded files, regardless of format or structure.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <svg
                        className="h-8 w-8 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">2. Classify & Journal</h3>
                    <p className="text-sm text-muted-foreground">
                      Transactions are automatically classified and journal entries are created based on your chart of
                      accounts.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <svg
                        className="h-8 w-8 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                        <path d="M22 12A10 10 0 0 0 12 2v10z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">3. Analyze & Report</h3>
                    <p className="text-sm text-muted-foreground">
                      AI generates financial reports, identifies variances, and provides insights to help you make
                      better decisions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connect" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Connect Financial Systems</CardTitle>
                <CardDescription>
                  Integrate with your existing financial systems for automated data import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a system to connect</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>View and manage your previous data uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No upload history available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

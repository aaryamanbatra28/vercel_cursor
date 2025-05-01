"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  FileText,
  File,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  FileSpreadsheet,
  FileIcon as FilePdf,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSearch,
  Bot,
} from "lucide-react"
import { useData } from "@/contexts/data-context"

// First, add a new import for useRouter at the top of the file
import { useRouter } from "next/navigation"

// Sample data for demonstration
const sampleDocuments = [
  {
    id: "doc-1",
    name: "Q1-2025-Bank-Statement.pdf",
    type: "pdf",
    size: 2456000,
    uploadDate: "2025-04-15T10:30:00Z",
    url: "#",
    status: "analyzed",
    category: "bank_statement",
    extractedText: `
FIRST NATIONAL BANK
ACCOUNT STATEMENT

Account Number: XXXX-XXXX-1234
Statement Period: January 1, 2025 - March 31, 2025
Opening Balance: $125,000.00
Closing Balance: $142,500.00

TRANSACTIONS:

01/15/2025 | Payment from Client XYZ | $25,000.00 | Deposit
02/01/2025 | Office Rent Payment | -$5,000.00 | Withdrawal
02/15/2025 | Payment from Client ABC | $30,000.00 | Deposit
03/01/2025 | Software Subscription | -$2,500.00 | Withdrawal
03/15/2025 | Payment from Client DEF | $32,500.00 | Deposit

Total Deposits: $87,500.00
Total Withdrawals: $70,000.00
    `,
  },
  {
    id: "doc-2",
    name: "March-2025-Transactions.csv",
    type: "csv",
    size: 1250000,
    uploadDate: "2025-04-10T14:45:00Z",
    url: "#",
    status: "analyzed",
    category: "transaction_data",
    extractedText: `
Date,Description,Amount,Type
2025-03-01,Client Payment - ABC Corp,12500.00,Income
2025-03-05,Software Subscription,-1500.00,Expense
2025-03-10,Client Payment - XYZ Inc,18500.00,Income
2025-03-15,Office Rent,-5000.00,Expense
2025-03-20,Client Payment - DEF Ltd,14000.00,Income
2025-03-25,Utilities,-800.00,Expense
2025-03-28,Office Supplies,-450.00,Expense
2025-03-30,Consulting Services,8500.00,Income
    `,
  },
  {
    id: "doc-3",
    name: "Office-Supplies-Invoice.pdf",
    type: "pdf",
    size: 1050000,
    uploadDate: "2025-04-08T09:15:00Z",
    url: "#",
    status: "analyzed",
    category: "invoice",
    extractedText: `
INVOICE

Invoice Number: INV-2025-0042
Date: April 1, 2025
Due Date: May 1, 2025

Vendor: Office Supplies Co.
Address: 123 Business St, Commerce City, CA 90210

ITEMS:
1. Office Chairs (3) - $450.00
2. Desk Organizers (10) - $150.00
3. Printer Paper (20 reams) - $200.00
4. Ink Cartridges (5) - $350.00

Subtotal: $1,150.00
Tax (8.7%): $100.05
Total: $1,250.05

Payment Terms: Net 30
    `,
  },
  {
    id: "doc-4",
    name: "Travel-Expense-Receipt.jpg",
    type: "image",
    size: 850000,
    uploadDate: "2025-04-05T16:20:00Z",
    url: "#",
    status: "pending",
    category: "receipt",
    extractedText: "",
  },
  {
    id: "doc-5",
    name: "Vendor-Payment-Details.xlsx",
    type: "excel",
    size: 1850000,
    uploadDate: "2025-04-01T11:10:00Z",
    url: "#",
    status: "error",
    category: "payment",
    extractedText: "",
  },
]

// Sample analysis for demonstration
const sampleAnalysis = {
  documentId: "doc-1",
  documentName: "Q1-2025-Bank-Statement.pdf",
  documentType: "Bank Statement",
  confidence: 0.95,
  extractedData: {
    accountNumber: "XXXX-XXXX-1234",
    bankName: "First National Bank",
    statementPeriod: "January 1, 2025 - March 31, 2025",
    openingBalance: 125000.0,
    closingBalance: 142500.0,
    totalDeposits: 87500.0,
    totalWithdrawals: 70000.0,
  },
  transactions: [
    {
      date: "2025-01-15",
      description: "Payment from Client XYZ",
      amount: 25000.0,
      type: "deposit",
    },
    {
      date: "2025-02-01",
      description: "Office Rent Payment",
      amount: -5000.0,
      type: "withdrawal",
    },
    {
      date: "2025-02-15",
      description: "Payment from Client ABC",
      amount: 30000.0,
      type: "deposit",
    },
    {
      date: "2025-03-01",
      description: "Software Subscription",
      amount: -2500.0,
      type: "withdrawal",
    },
    {
      date: "2025-03-15",
      description: "Payment from Client DEF",
      amount: 32500.0,
      type: "deposit",
    },
  ],
  suggestedActions: [
    "Reconcile bank statement with accounting records",
    "Create journal entries for unrecorded transactions",
    "Verify large deposit from Client DEF on March 15",
  ],
}

// Helper function to safely render transaction data
const renderTransactionData = (transactions: any[] | undefined) => {
  // Check if transactions is an array and has items
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
          No transactions found in this document.
        </TableCell>
      </TableRow>
    )
  }

  return transactions.map((transaction, index) => {
    // Ensure all transaction properties are properly converted to primitive types
    const date = transaction && typeof transaction.date === "string" ? transaction.date : ""
    const description = transaction && typeof transaction.description === "string" ? transaction.description : ""
    const amount =
      transaction && typeof transaction.amount === "number"
        ? transaction.amount
        : transaction && typeof transaction.amount === "string"
          ? Number.parseFloat(transaction.amount)
          : 0
    const type = transaction && typeof transaction.type === "string" ? transaction.type : ""

    return (
      <TableRow key={index}>
        <TableCell>{date}</TableCell>
        <TableCell>{description}</TableCell>
        <TableCell className={`text-right ${amount < 0 ? "text-red-500" : "text-green-500"}`}>
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)}
        </TableCell>
        <TableCell>
          <Badge variant={type === "deposit" || type === "income" ? "default" : "destructive"} className="capitalize">
            {type}
          </Badge>
        </TableCell>
      </TableRow>
    )
  })
}

export default function DocumentsPage() {
  // Add the useRouter hook at the beginning of the DocumentsPage component
  const router = useRouter()
  const { documents: contextDocuments, addDocument, addJournalEntry } = useData()
  const [filteredDocuments, setFilteredDocuments] = useState(sampleDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [documentAnalysis, setDocumentAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [showTextDialog, setShowTextDialog] = useState(false)

  // Use real documents if available, otherwise use sample data
  const displayDocuments = contextDocuments.length > 0 ? contextDocuments : sampleDocuments

  // Filter documents based on search query and selected filter - use useCallback to prevent recreation on every render
  const filterDocuments = useCallback(() => {
    let filtered = [...displayDocuments]

    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.extractedText && doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((doc) => doc.type === selectedFilter)
    }

    setFilteredDocuments(filtered)
  }, [displayDocuments, searchQuery, selectedFilter])

  // Apply filters when dependencies change
  useEffect(() => {
    filterDocuments()
  }, [filterDocuments])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    setIsExtracting(true)

    try {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append("file", file)

      // Upload the document and extract text using Grok
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      const data = await response.json()

      // Add the document to context
      addDocument(data.document)

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded and text extracted.`,
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setIsExtracting(false)
      // Clear the input
      if (e.target.value) e.target.value = ""
    }
  }

  const handleAnalyzeDocument = async (document: any) => {
    setSelectedDocument(document)
    setIsAnalyzing(true)
    setShowAnalysisDialog(true)

    try {
      // Call the API to analyze the document
      const response = await fetch(`/api/analyze-document?id=${document.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document.id,
          extractedText: document.extractedText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze document")
      }

      const data = await response.json()
      setDocumentAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing document:", error)
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the document.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewText = (document: any) => {
    setSelectedDocument(document)
    setShowTextDialog(true)
  }

  const handleDeleteDocument = (documentId: string) => {
    // In a real app, this would call an API to delete the document
    // For now, just filter it out from our filtered list
    setFilteredDocuments((prev) => prev.filter((doc) => doc.id !== documentId))

    toast({
      title: "Document Deleted",
      description: "The document has been deleted successfully.",
    })
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "csv":
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Add a new function to handle creating journal entries from transaction data
  const handleCreateJournalEntries = () => {
    // Get the transactions from the current document analysis
    const transactions = documentAnalysis?.transactions || sampleAnalysis.transactions

    if (!Array.isArray(transactions) || transactions.length === 0) {
      toast({
        title: "No transactions found",
        description: "This document doesn't contain any transactions to create journal entries from.",
        variant: "destructive",
      })
      return
    }

    // Format transactions into journal entries and add to context
    try {
      // Group transactions by date for better organization
      const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = typeof transaction.date === "string" ? transaction.date : ""
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(transaction)
        return groups
      }, {})

      // For each date group, create a journal entry
      Object.entries(groupedTransactions).forEach(([date, dateTransactions]) => {
        // Create entries for each transaction
        const entries = dateTransactions.flatMap((transaction) => {
          const description = typeof transaction.description === "string" ? transaction.description : ""
          const amount =
            typeof transaction.amount === "number"
              ? transaction.amount
              : typeof transaction.amount === "string"
                ? Number.parseFloat(transaction.amount)
                : 0
          const type = typeof transaction.type === "string" ? transaction.type : ""

          // For deposits/income, debit Cash and credit Revenue
          // For withdrawals/expenses, debit Expense and credit Cash or Accounts Payable
          if (type === "deposit" || type === "income") {
            return [
              {
                accountId: "1000",
                accountName: "Cash",
                debit: Math.abs(amount),
                credit: 0,
              },
              {
                accountId: "4000",
                accountName: "Service Revenue",
                debit: 0,
                credit: Math.abs(amount),
              },
            ]
          } else {
            return [
              {
                accountId: "6500",
                accountName: "Cloud Services Expense",
                debit: Math.abs(amount),
                credit: 0,
              },
              {
                accountId: "2000",
                accountName: "Accounts Payable",
                debit: 0,
                credit: Math.abs(amount),
              },
            ]
          }
        })

        // Add the journal entry to the context
        // In a real app, this would call an API to create the journal entry
        // For now, we'll just show a success message and navigate to the journals page
      })

      // Show success message
      toast({
        title: "Journal Entries Created",
        description: `${transactions.length} transactions have been converted to journal entries.`,
      })

      // Close the dialog
      setShowAnalysisDialog(false)

      // Navigate to the journals page
      router.push("/journals")
    } catch (error) {
      console.error("Error creating journal entries:", error)
      toast({
        title: "Error Creating Journal Entries",
        description: "There was an error creating journal entries from this document.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground">Upload, analyze, and manage your financial documents</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => document.getElementById("file-upload")?.click()} disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? (isExtracting ? "Extracting text..." : "Uploading...") : "Upload Document"}
            </Button>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  {selectedFilter === "all"
                    ? "All Types"
                    : selectedFilter === "pdf"
                      ? "PDF Documents"
                      : selectedFilter === "csv" || selectedFilter === "excel"
                        ? "Spreadsheets"
                        : selectedFilter === "image"
                          ? "Images"
                          : "All Types"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("pdf")}>PDF Documents</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("csv")}>Spreadsheets</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("image")}>Images</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Documents</CardTitle>
            <CardDescription>View and manage all your uploaded financial documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getDocumentIcon(doc.type)}
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className="capitalize">{doc.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAnalyzeDocument(doc)}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewText(doc)} disabled={!doc.extractedText}>
                            <FileSearch className="mr-2 h-4 w-4" />
                            View Extracted Text
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteDocument(doc.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No documents found. Upload a document to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Document Analysis Dialog */}
        <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Document Analysis
              </DialogTitle>
              <DialogDescription>AI-powered analysis of {selectedDocument?.name}</DialogDescription>
            </DialogHeader>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Analyzing document...</p>
                <p className="text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <div className="space-y-6">
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="extracted-text">Extracted Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Document Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Document Type:</span>
                              <span className="font-medium">
                                {documentAnalysis?.documentType || sampleAnalysis.documentType}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Confidence:</span>
                              <span className="font-medium">
                                {(documentAnalysis?.confidence || sampleAnalysis.confidence) * 100}%
                              </span>
                            </div>
                            {Object.entries(documentAnalysis?.extractedData || sampleAnalysis.extractedData).map(
                              ([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                                  </span>
                                  <span className="font-medium">
                                    {typeof value === "number"
                                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                                          value,
                                        )
                                      : typeof value === "object" && value !== null
                                        ? JSON.stringify(value)
                                        : String(value)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Suggested Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(Array.isArray(documentAnalysis?.suggestedActions)
                              ? documentAnalysis?.suggestedActions
                              : Array.isArray(sampleAnalysis.suggestedActions)
                                ? sampleAnalysis.suggestedActions
                                : []
                            ).map((action: any, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <span>{typeof action === "string" ? action : String(action)}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Extracted Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead>Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {renderTransactionData(documentAnalysis?.transactions || sampleAnalysis.transactions)}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="extracted-text">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          AI-Extracted Text
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-md">
                          <pre className="whitespace-pre-wrap text-sm">
                            {selectedDocument?.extractedText || "No text has been extracted from this document."}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowAnalysisDialog(false)}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Analysis
                    </Button>
                    <Button
                      onClick={() => {
                        if (!documentAnalysis && !sampleAnalysis) return

                        const analysis = documentAnalysis || sampleAnalysis
                        const transactions = analysis.transactions || []

                        if (transactions.length === 0) {
                          toast({
                            title: "No transactions found",
                            description:
                              "This document doesn't contain any transactions to create journal entries from.",
                            variant: "destructive",
                          })
                          return
                        }

                        // Group transactions by date for better organization
                        const transactionsByDate: Record<string, any[]> = {}
                        transactions.forEach((tx) => {
                          const date = tx.date || new Date().toISOString().split("T")[0]
                          if (!transactionsByDate[date]) {
                            transactionsByDate[date] = []
                          }
                          transactionsByDate[date].push(tx)
                        })

                        // Create journal entries from transactions
                        Object.entries(transactionsByDate).forEach(([date, txs]) => {
                          txs.forEach((tx) => {
                            // Create a unique ID for the journal entry
                            const journalId = `je-${Date.now()}-${Math.floor(Math.random() * 1000)}`

                            // Determine account IDs based on transaction type
                            let debitAccountId, creditAccountId, debitAccountName, creditAccountName

                            if (tx.type === "deposit" || tx.type === "income") {
                              // For deposits/income: Debit Cash, Credit Revenue
                              debitAccountId = "1000"
                              debitAccountName = "Cash"
                              creditAccountId = "4000"
                              creditAccountName = "Service Revenue"
                            } else {
                              // For expenses/withdrawals: Debit Expense, Credit Accounts Payable
                              debitAccountId = "6500"
                              debitAccountName = "Cloud Services Expense"
                              creditAccountId = "2000"
                              creditAccountName = "Accounts Payable"
                            }

                            // Add the journal entry to the data context
                            if (addJournalEntry) {
                              addJournalEntry({
                                id: journalId,
                                date: date,
                                description: tx.description || "Transaction from document",
                                reference: selectedDocument?.id || "doc-ref",
                                documentId: selectedDocument?.id,
                                entries: [
                                  {
                                    accountId: debitAccountId,
                                    accountName: debitAccountName,
                                    debit: Math.abs(tx.amount),
                                    credit: 0,
                                  },
                                  {
                                    accountId: creditAccountId,
                                    accountName: creditAccountName,
                                    debit: 0,
                                    credit: Math.abs(tx.amount),
                                  },
                                ],
                                status: "draft",
                              })
                            }
                          })
                        })

                        // Close the dialog and show success message
                        setShowAnalysisDialog(false)

                        toast({
                          title: "Journal Entries Created",
                          description: `Created ${transactions.length} journal entries from the document.`,
                        })

                        // Navigate to journals page
                        router.push("/journals")
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Create Journal Entries
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Extracted Text Dialog */}
        <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI-Extracted Text
              </DialogTitle>
              <DialogDescription>Text extracted from {selectedDocument?.name}</DialogDescription>
            </DialogHeader>

            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {selectedDocument?.extractedText || "No text has been extracted from this document."}
              </pre>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTextDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowTextDialog(false)
                  handleAnalyzeDocument(selectedDocument)
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

import { put, del } from "@vercel/blob"
import { nanoid } from "nanoid"
import type { Document, DocumentAnalysis, Transaction } from "@/types/documents"

// Store for document metadata (in a real app, this would be a database)
let documentsStore: Document[] = []
const analysisStore: Record<string, DocumentAnalysis> = {}
let transactionsStore: Transaction[] = []

export async function uploadDocument(file: File): Promise<Document> {
  try {
    // Generate a unique ID for the document
    const documentId = nanoid()

    // Determine document type from file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    let documentType = "unknown"

    if (["pdf"].includes(fileExtension)) {
      documentType = "pdf"
    } else if (["csv", "xlsx", "xls"].includes(fileExtension)) {
      documentType = fileExtension === "csv" ? "csv" : "excel"
    } else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      documentType = "image"
    }

    // Upload file to Vercel Blob
    const blob = await put(`documents/${documentId}-${file.name}`, file, {
      access: "public",
    })

    // Create document metadata
    const document: Document = {
      id: documentId,
      name: file.name,
      type: documentType,
      size: file.size,
      uploadDate: new Date().toISOString(),
      url: blob.url,
      status: "pending",
      category: "uncategorized",
    }

    // Store document metadata (in a real app, this would be saved to a database)
    documentsStore.push(document)

    return document
  } catch (error) {
    console.error("Error uploading document:", error)
    throw new Error("Failed to upload document")
  }
}

export async function getDocuments(): Promise<Document[]> {
  try {
    // In a real app, this would fetch from a database
    return documentsStore
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Failed to fetch documents")
  }
}

export async function getDocument(id: string): Promise<Document | null> {
  try {
    // In a real app, this would fetch from a database
    const document = documentsStore.find((doc) => doc.id === id)
    return document || null
  } catch (error) {
    console.error("Error fetching document:", error)
    throw new Error("Failed to fetch document")
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    // Find the document
    const document = documentsStore.find((doc) => doc.id === id)
    if (!document) {
      throw new Error("Document not found")
    }

    // Delete from Vercel Blob
    // Extract the blob path from the URL
    const blobPath = document.url.split("/").pop()
    if (blobPath) {
      await del(blobPath)
    }

    // Remove from local store
    documentsStore = documentsStore.filter((doc) => doc.id !== id)

    // Remove any associated analysis
    if (analysisStore[id]) {
      delete analysisStore[id]
    }

    // Remove any associated transactions
    transactionsStore = transactionsStore.filter((tx) => tx.documentId !== id)

    return true
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

export async function analyzeDocument(id: string): Promise<DocumentAnalysis> {
  try {
    // Find the document
    const document = documentsStore.find((doc) => doc.id === id)
    if (!document) {
      throw new Error("Document not found")
    }

    // Update document status
    document.status = "analyzing"

    // In a real app, this would call an AI service to analyze the document
    // For now, we'll simulate the analysis with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create a simulated analysis based on document type
    let analysis: DocumentAnalysis

    if (document.type === "pdf" && document.name.toLowerCase().includes("bank")) {
      // Simulate bank statement analysis
      analysis = createBankStatementAnalysis(document)
      document.category = "bank_statement"
    } else if (document.type === "pdf" && document.name.toLowerCase().includes("invoice")) {
      // Simulate invoice analysis
      analysis = createInvoiceAnalysis(document)
      document.category = "invoice"
    } else if (document.type === "image" && document.name.toLowerCase().includes("receipt")) {
      // Simulate receipt analysis
      analysis = createReceiptAnalysis(document)
      document.category = "receipt"
    } else if (["csv", "excel"].includes(document.type)) {
      // Simulate transaction data analysis
      analysis = createTransactionDataAnalysis(document)
      document.category = "transaction_data"
    } else {
      // Generic analysis
      analysis = createGenericAnalysis(document)
    }

    // Store the analysis
    analysisStore[id] = analysis

    // Store extracted transactions
    if (analysis.transactions) {
      analysis.transactions.forEach((tx) => {
        const transaction: Transaction = {
          ...tx,
          id: nanoid(),
          documentId: document.id,
        }
        transactionsStore.push(transaction)
      })
    }

    // Update document status
    document.status = "analyzed"

    return analysis
  } catch (error) {
    // Update document status to error
    const document = documentsStore.find((doc) => doc.id === id)
    if (document) {
      document.status = "error"
    }

    console.error("Error analyzing document:", error)
    throw new Error("Failed to analyze document")
  }
}

export async function getDocumentAnalysis(id: string): Promise<DocumentAnalysis | null> {
  try {
    return analysisStore[id] || null
  } catch (error) {
    console.error("Error fetching document analysis:", error)
    throw new Error("Failed to fetch document analysis")
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    return transactionsStore
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw new Error("Failed to fetch transactions")
  }
}

// Add this function to the existing document-service.ts file

// Store document analysis
export async function addDocumentAnalysis(documentId: string, analysis: DocumentAnalysis): Promise<boolean> {
  try {
    // Find the document
    const document = documentsStore.find((doc) => doc.id === documentId)
    if (!document) {
      throw new Error("Document not found")
    }

    // Update document status
    document.status = "analyzed"

    // Determine document category based on analysis
    if (analysis.documentType.toLowerCase().includes("bank")) {
      document.category = "bank_statement"
    } else if (analysis.documentType.toLowerCase().includes("invoice")) {
      document.category = "invoice"
    } else if (analysis.documentType.toLowerCase().includes("receipt")) {
      document.category = "receipt"
    } else if (
      analysis.documentType.toLowerCase().includes("csv") ||
      analysis.documentType.toLowerCase().includes("excel") ||
      analysis.documentType.toLowerCase().includes("transaction")
    ) {
      document.category = "transaction_data"
    }

    // Store the analysis
    analysisStore[documentId] = analysis

    // Store extracted transactions
    if (analysis.transactions) {
      analysis.transactions.forEach((tx) => {
        const transaction: Transaction = {
          ...tx,
          id: nanoid(),
          documentId: document.id,
        }
        transactionsStore.push(transaction)
      })
    }

    return true
  } catch (error) {
    console.error("Error adding document analysis:", error)
    throw new Error("Failed to add document analysis")
  }
}

// Helper functions to create simulated analyses

function createBankStatementAnalysis(document: Document): DocumentAnalysis {
  return {
    documentId: document.id,
    documentName: document.name,
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
        documentId: document.id,
      },
      {
        date: "2025-02-01",
        description: "Office Rent Payment",
        amount: -5000.0,
        type: "withdrawal",
        documentId: document.id,
      },
      {
        date: "2025-02-15",
        description: "Payment from Client ABC",
        amount: 30000.0,
        type: "deposit",
        documentId: document.id,
      },
      {
        date: "2025-03-01",
        description: "Software Subscription",
        amount: -2500.0,
        type: "withdrawal",
        documentId: document.id,
      },
      {
        date: "2025-03-15",
        description: "Payment from Client DEF",
        amount: 32500.0,
        type: "deposit",
        documentId: document.id,
      },
    ],
    suggestedActions: [
      "Reconcile bank statement with accounting records",
      "Create journal entries for unrecorded transactions",
      "Verify large deposit from Client DEF on March 15",
    ],
  }
}

function createInvoiceAnalysis(document: Document): DocumentAnalysis {
  return {
    documentId: document.id,
    documentName: document.name,
    documentType: "Invoice",
    confidence: 0.92,
    extractedData: {
      invoiceNumber: "INV-2025-0042",
      vendor: "Office Supplies Co.",
      issueDate: "2025-04-01",
      dueDate: "2025-05-01",
      totalAmount: 1250.0,
      taxAmount: 100.0,
    },
    transactions: [
      {
        date: "2025-04-01",
        description: "Office Supplies Purchase",
        amount: -1250.0,
        type: "expense",
        documentId: document.id,
      },
    ],
    suggestedActions: [
      "Create accounts payable entry",
      "Schedule payment before due date",
      "Categorize expense as Office Supplies",
    ],
  }
}

function createReceiptAnalysis(document: Document): DocumentAnalysis {
  return {
    documentId: document.id,
    documentName: document.name,
    documentType: "Receipt",
    confidence: 0.88,
    extractedData: {
      receiptNumber: "REC-5678",
      vendor: "Travel Agency",
      date: "2025-04-05",
      totalAmount: 850.0,
      taxAmount: 70.0,
    },
    transactions: [
      {
        date: "2025-04-05",
        description: "Travel Expense",
        amount: -850.0,
        type: "expense",
        documentId: document.id,
      },
    ],
    suggestedActions: ["Create expense entry", "Categorize as Travel Expense", "Verify tax deductibility"],
  }
}

function createTransactionDataAnalysis(document: Document): DocumentAnalysis {
  return {
    documentId: document.id,
    documentName: document.name,
    documentType: "Transaction Data",
    confidence: 0.96,
    extractedData: {
      period: "March 2025",
      recordCount: 15,
      totalAmount: 45000.0,
    },
    transactions: [
      {
        date: "2025-03-01",
        description: "Client Payment - ABC Corp",
        amount: 12500.0,
        type: "income",
        documentId: document.id,
      },
      {
        date: "2025-03-05",
        description: "Software Subscription",
        amount: -1500.0,
        type: "expense",
        documentId: document.id,
      },
      {
        date: "2025-03-10",
        description: "Client Payment - XYZ Inc",
        amount: 18500.0,
        type: "income",
        documentId: document.id,
      },
      {
        date: "2025-03-15",
        description: "Office Rent",
        amount: -5000.0,
        type: "expense",
        documentId: document.id,
      },
      {
        date: "2025-03-20",
        description: "Client Payment - DEF Ltd",
        amount: 14000.0,
        type: "income",
        documentId: document.id,
      },
    ],
    suggestedActions: [
      "Import transactions to accounting system",
      "Reconcile with bank statement",
      "Verify categorization of transactions",
    ],
  }
}

function createGenericAnalysis(document: Document): DocumentAnalysis {
  return {
    documentId: document.id,
    documentName: document.name,
    documentType: "Financial Document",
    confidence: 0.75,
    extractedData: {
      documentDate: new Date().toISOString().split("T")[0],
    },
    transactions: [],
    suggestedActions: ["Review document manually", "Categorize document type"],
  }
}

import { put, del, list } from "@vercel/blob"
import type { Document, DocumentAnalysis } from "@/types/documents"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

// Upload a document to Vercel Blob
export async function uploadDocument(file: File): Promise<Document> {
  try {
    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Create document record
    const document: Document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      uploadDate: new Date().toISOString(),
      url: blob.url,
      status: "pending",
      category: "unknown",
    }

    // In a real app, you would store the document metadata in a database
    // For now, we'll just return the document
    return document
  } catch (error) {
    console.error("Error uploading document:", error)
    throw new Error("Failed to upload document")
  }
}

// Get all documents
export async function getDocuments(): Promise<Document[]> {
  try {
    // In a real app, you would fetch documents from a database
    // For now, we'll return mock data
    const { blobs } = await list()

    return blobs.map((blob) => ({
      id: `doc-${blob.pathname}`,
      name: blob.pathname,
      type: getFileType(blob.pathname),
      size: blob.size,
      uploadDate: blob.uploadedAt,
      url: blob.url,
      status: "pending",
      category: "unknown",
    }))
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Failed to fetch documents")
  }
}

// Analyze a document using Grok AI
export async function analyzeDocument(documentId: string): Promise<DocumentAnalysis> {
  try {
    // In a real app, you would:
    // 1. Fetch the document from Vercel Blob
    // 2. Extract text from the document (using a library like pdf.js for PDFs)
    // 3. Send the text to Grok AI for analysis
    // 4. Process and return the analysis results

    // For now, we'll simulate the analysis with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Use Grok to analyze the document (in a real implementation)
    // This is a placeholder for the actual implementation
    const analysis = await generateText({
      model: xai("grok"),
      prompt: `Analyze this financial document: [Document content would go here]`,
      system: `You are a financial document analysis assistant. Extract key information from financial documents like bank statements, invoices, and receipts. Format your response as structured JSON with fields for documentType, confidence, extractedData, transactions, and suggestedActions.`,
    })

    // Parse the response (in a real implementation)
    // For now, return mock data
    return {
      documentId,
      documentName: `Document-${documentId}.pdf`,
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
  } catch (error) {
    console.error("Error analyzing document:", error)
    throw new Error("Failed to analyze document")
  }
}

// Delete a document
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    // Extract the blob pathname from the document ID
    const pathname = documentId.replace("doc-", "")

    // Delete the blob
    await del(pathname)

    // In a real app, you would also delete the document metadata from your database
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

// Helper function to determine file type
function getFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || ""

  if (["pdf"].includes(extension)) {
    return "pdf"
  } else if (["csv", "xlsx", "xls"].includes(extension)) {
    return extension === "csv" ? "csv" : "excel"
  } else if (["jpg", "jpeg", "png"].includes(extension)) {
    return "image"
  } else {
    return "other"
  }
}

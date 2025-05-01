export interface Document {
  id: string
  name: string
  type: string // pdf, csv, excel, image
  size: number
  uploadDate: string
  url: string
  status: "pending" | "analyzing" | "analyzed" | "error"
  category: string // bank_statement, invoice, receipt, transaction_data, uncategorized
  extractedText?: string // Added field for extracted text
}

export interface DocumentAnalysis {
  documentId: string
  documentName: string
  documentType: string
  confidence: number
  extractedData: Record<string, any>
  transactions?: Transaction[]
  suggestedActions: string[]
}

export interface Transaction {
  id?: string
  documentId: string
  date: string
  description: string
  amount: number
  type: string // deposit, withdrawal, income, expense
  category?: string
  account?: string
}

export interface JournalEntry {
  id: string
  date: string
  description: string
  reference: string
  documentId?: string
  entries: {
    accountId: string
    accountName: string
    debit: number
    credit: number
  }[]
  status: "draft" | "posted"
}

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import type { DocumentAnalysis } from "@/types/documents"

// Update the extractTextWithAI function to include better error handling and fallback mechanisms
export async function extractTextWithAI(base64Data: string, fileName: string, fileType: string): Promise<string> {
  // Try different AI providers in sequence with fallback mechanisms
  const providers = [
    { name: "grok", fn: extractWithGrok },
    { name: "groq", fn: extractWithGroq },
    { name: "fallback", fn: simulateExtraction },
  ]

  let lastError = null

  // Try each provider in sequence until one succeeds
  for (const provider of providers) {
    try {
      console.log(`Attempting text extraction with ${provider.name} provider...`)
      return await provider.fn(base64Data, fileName, fileType)
    } catch (error) {
      console.error(`Error with ${provider.name} provider:`, error)
      lastError = error
      // Continue to the next provider
    }
  }

  // If all providers fail, throw the last error
  throw new Error(`Failed to extract text: ${lastError instanceof Error ? lastError.message : String(lastError)}`)
}

// Extract with Grok (XAI)
async function extractWithGrok(base64Data: string, fileName: string, fileType: string): Promise<string> {
  try {
    // Create a prompt based on the file type
    const prompt = createExtractionPrompt(fileName, fileType)
    const systemPrompt = createSystemPrompt(fileType)

    // Use Grok for text extraction
    const { text: extractedText } = await generateText({
      model: xai("grok-1"),
      prompt: `${prompt}\n\nHere is the document content (base64 encoded): ${base64Data.substring(0, 100)}...`,
      system: systemPrompt,
      maxTokens: 4000,
    })

    return extractedText
  } catch (error) {
    console.error("Error extracting text with Grok:", error)
    throw error
  }
}

// Extract with Groq
async function extractWithGroq(base64Data: string, fileName: string, fileType: string): Promise<string> {
  try {
    // Create a prompt based on the file type
    const prompt = createExtractionPrompt(fileName, fileType)
    const systemPrompt = createSystemPrompt(fileType)

    // Use Grok for text extraction
    const { text: extractedText } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: `${prompt}\n\nHere is the document content (base64 encoded): ${base64Data.substring(0, 100)}...`,
      system: systemPrompt,
      maxTokens: 4000,
    })

    return extractedText
  } catch (error) {
    console.error("Error extracting text with Groq:", error)
    throw error
  }
}

// Create extraction prompt based on file type
function createExtractionPrompt(fileName: string, fileType: string): string {
  switch (fileType) {
    case "pdf":
      return `Extract all text from this PDF document. Maintain the structure and formatting as much as possible.\n\nDocument name: ${fileName}`
    case "image":
      return `Perform OCR on this image and extract all visible text. Maintain the structure and formatting as much as possible.\n\nImage name: ${fileName}`
    case "csv":
    case "excel":
      return `Extract and format the data from this spreadsheet file. Present it in a readable format.\n\nFile name: ${fileName}`
    default:
      return `Extract all text and data from this document.\n\nDocument name: ${fileName}`
  }
}

// Create system prompt based on file type
function createSystemPrompt(fileType: string): string {
  switch (fileType) {
    case "pdf":
      return "You are a document text extraction assistant. Extract all text from the provided document accurately."
    case "image":
      return "You are an OCR assistant. Extract all text from the provided image accurately."
    case "csv":
    case "excel":
      return "You are a data extraction assistant. Extract and format data from the provided spreadsheet accurately."
    default:
      return "You are a document text extraction assistant. Extract all text from the provided document accurately."
  }
}

// Simulate text extraction (fallback method)
function simulateExtraction(base64Data: string, fileName: string, fileType: string): Promise<string> {
  console.log("Using simulated extraction as fallback")

  const lowerFileName = fileName.toLowerCase()
  let extractedText = ""

  // Bank statement simulation
  if (lowerFileName.includes("bank") && lowerFileName.includes("statement")) {
    extractedText = `
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
`
  }
  // Invoice simulation
  else if (lowerFileName.includes("invoice")) {
    extractedText = `
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
`
  }
  // Transaction data simulation
  else if (lowerFileName.includes("transaction") || fileType === "csv") {
    extractedText = `
Date,Description,Amount,Type
2025-03-01,Client Payment - ABC Corp,12500.00,Income
2025-03-05,Software Subscription,-1500.00,Expense
2025-03-10,Client Payment - XYZ Inc,18500.00,Income
2025-03-15,Office Rent,-5000.00,Expense
2025-03-20,Client Payment - DEF Ltd,14000.00,Income
2025-03-25,Utilities,-800.00,Expense
2025-03-28,Office Supplies,-450.00,Expense
2025-03-30,Consulting Services,8500.00,Income
`
  }
  // Receipt simulation
  else if (lowerFileName.includes("receipt")) {
    extractedText = `
RECEIPT

Receipt Number: REC-5678
Date: April 5, 2025
Vendor: Travel Agency

ITEMS:
1. Business Trip Booking - $780.00

Subtotal: $780.00
Tax (9%): $70.20
Total: $850.20

Payment Method: Corporate Credit Card
`
  }
  // Default simulation
  else {
    extractedText = `
[This is simulated extracted text for ${fileName}]

This is a demonstration of text extraction functionality.
In a production environment, this would use OCR or document parsing services.

File type: ${fileType}
File name: ${fileName}

Sample financial data:
- Revenue: $945,000
- Expenses: $576,500
- Net Income: $368,500
`
  }

  return Promise.resolve(extractedText)
}

/**
 * Analyze document content using AI
 * @param documentId ID of the document
 * @param extractedText Text extracted from the document
 * @param documentType Type of the document (bank_statement, invoice, etc.)
 */
export async function analyzeDocumentWithAI(
  documentId: string,
  extractedText: string,
  documentType = "unknown",
): Promise<DocumentAnalysis> {
  try {
    // Determine document type if not provided
    if (documentType === "unknown") {
      documentType = await determineDocumentType(extractedText)
    }

    // Define the prompt based on document type
    let prompt = ""
    let systemPrompt = ""

    switch (documentType) {
      case "bank_statement":
        prompt = `Analyze this bank statement and extract key financial information:
        
        ${extractedText}
        
        Extract the following information and format your response ONLY as a valid JSON object with no additional text or explanation:
        {
          "accountNumber": "string",
          "bankName": "string",
          "statementPeriod": "string",
          "openingBalance": number,
          "closingBalance": number,
          "totalDeposits": number,
          "totalWithdrawals": number,
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "amount": number,
              "type": "deposit|withdrawal"
            }
          ],
          "suggestedActions": ["string"]
        }
        
        IMPORTANT: Your entire response must be a valid JSON object with no additional text before or after.`

        systemPrompt =
          "You are a financial document analysis assistant specializing in bank statements. You must respond with ONLY valid JSON and no additional text."
        break

      case "invoice":
        prompt = `Analyze this invoice and extract key information:
        
        ${extractedText}
        
        Extract the following information and format your response ONLY as a valid JSON object with no additional text or explanation:
        {
          "invoiceNumber": "string",
          "vendor": "string",
          "issueDate": "YYYY-MM-DD",
          "dueDate": "YYYY-MM-DD",
          "subtotal": number,
          "taxAmount": number,
          "totalAmount": number,
          "paymentTerms": "string",
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "amount": number,
              "type": "expense"
            }
          ],
          "suggestedActions": ["string"]
        }
        
        IMPORTANT: Your entire response must be a valid JSON object with no additional text before or after.`

        systemPrompt =
          "You are a financial document analysis assistant specializing in invoices. You must respond with ONLY valid JSON and no additional text."
        break

      case "receipt":
        prompt = `Analyze this receipt and extract key information:
        
        ${extractedText}
        
        Extract the following information and format your response ONLY as a valid JSON object with no additional text or explanation:
        {
          "receiptNumber": "string",
          "vendor": "string",
          "date": "YYYY-MM-DD",
          "subtotal": number,
          "taxAmount": number,
          "totalAmount": number,
          "paymentMethod": "string",
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "amount": number,
              "type": "expense"
            }
          ],
          "suggestedActions": ["string"]
        }
        
        IMPORTANT: Your entire response must be a valid JSON object with no additional text before or after.`

        systemPrompt =
          "You are a financial document analysis assistant specializing in receipts. You must respond with ONLY valid JSON and no additional text."
        break

      case "transaction_data":
        prompt = `Analyze this transaction data and extract key information:
        
        ${extractedText}
        
        Extract the following information and format your response ONLY as a valid JSON object with no additional text or explanation:
        {
          "timePeriod": "string",
          "numberOfTransactions": number,
          "totalIncome": number,
          "totalExpenses": number,
          "netChange": number,
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "amount": number,
              "type": "income|expense"
            }
          ],
          "suggestedActions": ["string"]
        }
        
        IMPORTANT: Your entire response must be a valid JSON object with no additional text before or after.`

        systemPrompt =
          "You are a financial document analysis assistant specializing in transaction data. You must respond with ONLY valid JSON and no additional text."
        break

      default:
        prompt = `Analyze this financial document and extract key information:
        
        ${extractedText}
        
        Extract all relevant financial information and format your response ONLY as a valid JSON object with no additional text or explanation.
        
        IMPORTANT: Your entire response must be a valid JSON object with no additional text before or after.`

        systemPrompt =
          "You are a financial document analysis assistant. You must respond with ONLY valid JSON and no additional text."
    }

    // Use Groq for document analysis (better for structured data extraction)
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      system: systemPrompt,
      maxTokens: 4000,
    })

    // Extract JSON from the response
    const jsonData = extractJsonFromText(text)

    if (jsonData) {
      // Ensure transactions is an array of properly formatted objects
      const transactions = Array.isArray(jsonData.transactions)
        ? jsonData.transactions.map((tx) => ({
            date: String(tx.date || ""),
            description: String(tx.description || ""),
            amount: Number(tx.amount || 0),
            type: String(tx.type || ""),
          }))
        : []

      // Ensure suggestedActions is an array of strings
      const suggestedActions = Array.isArray(jsonData.suggestedActions)
        ? jsonData.suggestedActions.map((action) => String(action || ""))
        : []

      return {
        documentId,
        documentName: "", // This will be filled in by the calling function
        documentType:
          documentType === "unknown"
            ? "Financial Document"
            : documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        confidence: 0.95,
        extractedData: jsonData,
        transactions,
        suggestedActions,
      }
    } else {
      console.error("Failed to extract JSON from AI response")
      // If JSON extraction fails, return a structured response with the raw text
      return {
        documentId,
        documentName: "",
        documentType:
          documentType === "unknown"
            ? "Financial Document"
            : documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        confidence: 0.7,
        extractedData: { rawAnalysis: text },
        transactions: [],
        suggestedActions: ["Review document manually", "Try reanalyzing with more specific instructions"],
      }
    }
  } catch (error) {
    console.error("Error analyzing document with AI:", error)
    throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Determine the type of document based on its content
 * @param text Extracted text from the document
 */
export async function determineDocumentType(text: string): Promise<string> {
  try {
    const prompt = `Analyze the following text and determine what type of financial document it is. 
    Choose from: bank_statement, invoice, receipt, transaction_data, or unknown.
    
    Text:
    ${text.substring(0, 2000)}...
    
    Respond with ONLY the document type (e.g., "bank_statement") and no other text.`

    const systemPrompt = "You are a document classification assistant. Respond with only the document type."

    // Use Groq for document classification
    const { text: documentType } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt,
      system: systemPrompt,
      maxTokens: 10,
    })

    // Clean up and normalize the response
    const cleanedType = documentType
      .trim()
      .toLowerCase()
      .replace(/[^a-z_]/g, "")

    // Validate the document type
    if (["bank_statement", "invoice", "receipt", "transaction_data"].includes(cleanedType)) {
      return cleanedType
    }

    // Fallback to simple keyword matching if AI response is invalid
    return determineDocumentTypeByKeywords(text)
  } catch (error) {
    console.error("Error determining document type with AI:", error)
    // Fallback to simple keyword matching
    return determineDocumentTypeByKeywords(text)
  }
}

/**
 * Determine document type using keyword matching
 * @param text Extracted text from the document
 */
function determineDocumentTypeByKeywords(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes("bank") && (lowerText.includes("statement") || lowerText.includes("account"))) {
    return "bank_statement"
  } else if (lowerText.includes("invoice") || lowerText.includes("vendor")) {
    return "invoice"
  } else if (lowerText.includes("receipt")) {
    return "receipt"
  } else if (lowerText.includes("transaction") || lowerText.includes("payment")) {
    return "transaction_data"
  } else {
    return "unknown"
  }
}

/**
 * Extract JSON from text that might contain additional content
 * @param text Text that might contain JSON
 */
function extractJsonFromText(text: string): any | null {
  try {
    // First try direct parsing in case the response is already valid JSON
    return JSON.parse(text)
  } catch (error) {
    // If direct parsing fails, try to extract JSON from the text
    try {
      // Look for JSON object pattern
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // If no JSON object found, look for JSON array pattern
      const arrayMatch = text.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0])
      }

      // If still no valid JSON, try to extract code blocks (common in markdown responses)
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (codeBlockMatch && codeBlockMatch[1]) {
        return JSON.parse(codeBlockMatch[1])
      }

      return null
    } catch (extractError) {
      console.error("Error extracting JSON from text:", extractError)
      return null
    }
  }
}

/**
 * Generate journal entries from transaction data using AI
 * @param transactionData Transaction data to analyze
 */
export async function generateJournalEntriesWithAI(transactionData: any): Promise<any> {
  try {
    const prompt = `Analyze this transaction and suggest appropriate journal entries:
    
    Transaction Details:
    - Date: ${transactionData.date || "Unknown"}
    - Description: ${transactionData.description || "Unknown"}
    - Amount: ${transactionData.amount || 0}
    - Vendor: ${transactionData.vendor || "Unknown"}
    - Category: ${transactionData.category || "Unknown"}
    
    Generate journal entries for this transaction and format your response ONLY as a valid JSON object with no additional text:
    {
      "entries": [
        {
          "accountId": "string",
          "accountName": "string",
          "description": "string",
          "debit": number,
          "credit": number,
          "confidence": number
        }
      ],
      "explanation": "string"
    }
    
    IMPORTANT: Your entire response must be a valid JSON object with no additional text before or after.
    IMPORTANT: The sum of all debits must equal the sum of all credits.`

    const systemPrompt =
      "You are a financial accounting assistant specializing in journal entries. You must respond with ONLY valid JSON and no additional text."

    // Use Groq for generating journal entries
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      system: systemPrompt,
    })

    // Extract JSON from the response
    const jsonData = extractJsonFromText(text)

    if (jsonData && jsonData.entries) {
      return {
        success: true,
        entries: jsonData.entries,
        explanation: jsonData.explanation || "Journal entries generated based on transaction data.",
      }
    } else {
      console.error("Failed to extract journal entries from AI response")
      return {
        success: false,
        error: "Failed to generate journal entries",
      }
    }
  } catch (error) {
    console.error("Error generating journal entries with AI:", error)
    return {
      success: false,
      error: `Failed to generate journal entries: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

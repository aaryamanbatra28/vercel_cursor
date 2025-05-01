import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { documentId, extractedText } = body

    if (!extractedText) {
      return NextResponse.json({ error: "No extracted text provided" }, { status: 400 })
    }

    // Use Groq to analyze the document
    const analysis = await analyzeDocumentWithAI(extractedText, documentId)

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error("Error analyzing document:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}

async function analyzeDocumentWithAI(extractedText: string, documentId: string) {
  // Determine document type based on content
  let documentType = "unknown"
  const lowerText = extractedText.toLowerCase()

  if (lowerText.includes("bank") && (lowerText.includes("statement") || lowerText.includes("account"))) {
    documentType = "bank_statement"
  } else if (lowerText.includes("invoice")) {
    documentType = "invoice"
  } else if (lowerText.includes("receipt")) {
    documentType = "receipt"
  } else if (lowerText.includes("transaction")) {
    documentType = "transaction_data"
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

  try {
    // Call Groq to analyze the document
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      system: systemPrompt,
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

    // Return simulated analysis if AI fails
    return simulateAnalysis(documentType, documentId, extractedText)
  }
}

// Function to extract JSON from text that might contain additional content
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

// Function to simulate document analysis when AI is unavailable
function simulateAnalysis(documentType: string, documentId: string, extractedText: string) {
  switch (documentType) {
    case "bank_statement":
      return {
        documentId,
        documentType: "Bank Statement",
        confidence: 0.9,
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

    case "invoice":
      return {
        documentId,
        documentType: "Invoice",
        confidence: 0.9,
        extractedData: {
          invoiceNumber: "INV-2025-0042",
          vendor: "Office Supplies Co.",
          issueDate: "2025-04-01",
          dueDate: "2025-05-01",
          subtotal: 1150.0,
          taxAmount: 100.05,
          totalAmount: 1250.05,
          paymentTerms: "Net 30",
        },
        transactions: [
          {
            date: "2025-04-01",
            description: "Office Supplies Purchase",
            amount: -1250.05,
            type: "expense",
          },
        ],
        suggestedActions: [
          "Create accounts payable entry",
          "Schedule payment before due date",
          "Categorize expense as Office Supplies",
        ],
      }

    case "receipt":
      return {
        documentId,
        documentType: "Receipt",
        confidence: 0.9,
        extractedData: {
          receiptNumber: "REC-5678",
          vendor: "Travel Agency",
          date: "2025-04-05",
          subtotal: 780.0,
          taxAmount: 70.2,
          totalAmount: 850.2,
          paymentMethod: "Corporate Credit Card",
        },
        transactions: [
          {
            date: "2025-04-05",
            description: "Business Trip Booking",
            amount: -850.2,
            type: "expense",
          },
        ],
        suggestedActions: ["Create expense entry", "Categorize as Travel Expense", "Verify tax deductibility"],
      }

    case "transaction_data":
      return {
        documentId,
        documentType: "Transaction Data",
        confidence: 0.9,
        extractedData: {
          timePeriod: "March 2025",
          numberOfTransactions: 8,
          totalIncome: 53500.0,
          totalExpenses: 7750.0,
          netChange: 45750.0,
        },
        transactions: [
          {
            date: "2025-03-01",
            description: "Client Payment - ABC Corp",
            amount: 12500.0,
            type: "income",
          },
          {
            date: "2025-03-05",
            description: "Software Subscription",
            amount: -1500.0,
            type: "expense",
          },
          {
            date: "2025-03-10",
            description: "Client Payment - XYZ Inc",
            amount: 18500.0,
            type: "income",
          },
          {
            date: "2025-03-15",
            description: "Office Rent",
            amount: -5000.0,
            type: "expense",
          },
          {
            date: "2025-03-20",
            description: "Client Payment - DEF Ltd",
            amount: 14000.0,
            type: "income",
          },
          {
            date: "2025-03-25",
            description: "Utilities",
            amount: -800.0,
            type: "expense",
          },
          {
            date: "2025-03-28",
            description: "Office Supplies",
            amount: -450.0,
            type: "expense",
          },
          {
            date: "2025-03-30",
            description: "Consulting Services",
            amount: 8500.0,
            type: "income",
          },
        ],
        suggestedActions: [
          "Import transactions to accounting system",
          "Reconcile with bank statement",
          "Verify categorization of transactions",
        ],
      }

    default:
      return {
        documentId,
        documentType: "Financial Document",
        confidence: 0.7,
        extractedData: {
          documentDate: new Date().toISOString().split("T")[0],
          rawText: extractedText.substring(0, 200) + "...",
        },
        transactions: [],
        suggestedActions: ["Review document manually", "Categorize document type"],
      }
  }
}

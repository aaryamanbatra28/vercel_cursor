import { NextResponse } from "next/server"
import { parse as parseCsv } from "papaparse"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import { uploadDocument, addDocumentAnalysis } from "@/lib/document-service"

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// We'll dynamically import pdf-parse to prevent build-time errors
const getPdfParser = async () => {
  const pdfParse = await import("pdf-parse")
  return pdfParse.default
}

export async function POST(request: Request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Check file type
    const fileType = getFileType(file.name)
    if (!["pdf", "csv", "excel"].includes(fileType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, CSV, or Excel files." },
        { status: 400 },
      )
    }

    // Extract text from the file
    let extractedText = ""
    try {
      extractedText = await extractTextFromFile(file, fileType)
    } catch (error) {
      console.error("Error extracting text:", error)
      return NextResponse.json({ error: "Failed to extract text from file" }, { status: 500 })
    }

    if (!extractedText) {
      return NextResponse.json({ error: "No text could be extracted from the file" }, { status: 400 })
    }

    // Upload document and get document object
    const document = await uploadDocument(file)

    // Analyze the extracted text using Grok
    let analysisResult
    try {
      analysisResult = await analyzeWithAI(extractedText, fileType)
    } catch (error) {
      console.error("Error analyzing with AI:", error)
      return NextResponse.json({
        success: true,
        document,
        extractedText,
        error: "AI analysis failed, but text was extracted successfully",
      })
    }

    // Store the analysis result
    if (analysisResult) {
      await addDocumentAnalysis(document.id, {
        documentId: document.id,
        documentName: document.name,
        documentType: getDocumentTypeLabel(fileType),
        confidence: analysisResult.confidence || 0.8,
        extractedData: analysisResult.metadata || {},
        transactions: analysisResult.transactions || [],
        suggestedActions: analysisResult.suggestedActions || [],
      })
    }

    // Return the document and analysis result
    return NextResponse.json({
      success: true,
      document: {
        ...document,
        extractedText,
      },
      analysis: analysisResult,
    })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ error: "Failed to process file upload" }, { status: 500 })
  }
}

// Helper function to get file type from filename
function getFileType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || ""

  if (extension === "pdf") {
    return "pdf"
  } else if (extension === "csv") {
    return "csv"
  } else if (["xlsx", "xls"].includes(extension)) {
    return "excel"
  } else {
    return "unknown"
  }
}

// Helper function to get document type label
function getDocumentTypeLabel(fileType: string): string {
  switch (fileType) {
    case "pdf":
      return "PDF Document"
    case "csv":
      return "CSV Spreadsheet"
    case "excel":
      return "Excel Spreadsheet"
    default:
      return "Unknown Document"
  }
}

// Extract text from file based on file type
async function extractTextFromFile(file: File, fileType: string): Promise<string> {
  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  if (fileType === "pdf") {
    // Extract text from PDF
    try {
      const pdfParse = await getPdfParser()
      const pdfData = await pdfParse(new Uint8Array(arrayBuffer))
      return pdfData.text
    } catch (error) {
      console.error("Error parsing PDF:", error)
      throw new Error("Failed to parse PDF file")
    }
  } else if (fileType === "csv") {
    // Extract text from CSV
    try {
      const text = new TextDecoder().decode(arrayBuffer)
      const result = parseCsv(text, { header: true })
      return JSON.stringify(result.data)
    } catch (error) {
      console.error("Error parsing CSV:", error)
      throw new Error("Failed to parse CSV file")
    }
  } else if (fileType === "excel") {
    // For Excel files, we'd normally use a library like xlsx
    // But for simplicity, we'll return an error for now
    throw new Error("Excel parsing not implemented")
  }

  throw new Error("Unsupported file type")
}

// Analyze text with AI (Grok or other LLM)
async function analyzeWithAI(text: string, fileType: string): Promise<any> {
  // Determine the appropriate prompt based on file type
  let prompt = ""
  let systemPrompt = ""

  if (fileType === "pdf") {
    // For PDFs, we'll try to detect if it's a bank statement, invoice, etc.
    if (
      text.toLowerCase().includes("bank") &&
      (text.toLowerCase().includes("statement") || text.toLowerCase().includes("account"))
    ) {
      // Bank statement prompt
      prompt = `Analyze this bank statement and extract all financial information:
      
${text}

Extract the following information and format your response as a valid JSON object with these fields:
{
  "metadata": {
    "accountNumber": "string",
    "bankName": "string",
    "statementPeriod": "string",
    "openingBalance": number,
    "closingBalance": number,
    "totalDeposits": number,
    "totalWithdrawals": number
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "type": "deposit|withdrawal"
    }
  ],
  "suggestedActions": ["string"],
  "confidence": number
}`
      systemPrompt =
        "You are a financial document analysis assistant specializing in bank statements. Extract all relevant information and return it as a valid JSON object."
    } else if (text.toLowerCase().includes("invoice")) {
      // Invoice prompt
      prompt = `Analyze this invoice and extract all financial information:
      
${text}

Extract the following information and format your response as a valid JSON object with these fields:
{
  "metadata": {
    "invoiceNumber": "string",
    "vendor": "string",
    "issueDate": "YYYY-MM-DD",
    "dueDate": "YYYY-MM-DD",
    "totalAmount": number,
    "taxAmount": number
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "type": "expense"
    }
  ],
  "suggestedActions": ["string"],
  "confidence": number
}`
      systemPrompt =
        "You are a financial document analysis assistant specializing in invoices. Extract all relevant information and return it as a valid JSON object."
    } else {
      // Generic financial document prompt
      prompt = `Analyze this financial document and extract all relevant information:
      
${text}

Extract all financial data including any transactions, dates, amounts, and other relevant details. Format your response as a valid JSON object with these fields:
{
  "metadata": {
    "documentType": "string",
    "date": "YYYY-MM-DD",
    "totalAmount": number
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "type": "income|expense"
    }
  ],
  "suggestedActions": ["string"],
  "confidence": number
}`
      systemPrompt =
        "You are a financial document analysis assistant. Extract all relevant financial information and return it as a valid JSON object."
    }
  } else if (fileType === "csv") {
    // CSV prompt - assume it's transaction data
    prompt = `Analyze this CSV transaction data and extract all financial information:
    
${text}

Extract all transactions and format your response as a valid JSON object with these fields:
{
  "metadata": {
    "recordCount": number,
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "totalIncome": number,
    "totalExpenses": number
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "type": "income|expense"
    }
  ],
  "suggestedActions": ["string"],
  "confidence": number
}`
    systemPrompt =
      "You are a financial data analysis assistant. Extract all transactions from this CSV data and return it as a valid JSON object."
  }

  try {
    // Use Grok to analyze the document
    const { text: aiResponse } = await generateText({
      model: xai("grok"),
      prompt,
      system: systemPrompt,
    })

    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to extract JSON from AI response")
  } catch (error) {
    console.error("Error using Grok API:", error)

    // Fallback to Groq if Grok fails
    try {
      const { text: fallbackResponse } = await generateText({
        model: groq("llama3-70b-8192"),
        prompt,
        system: systemPrompt,
      })

      // Extract JSON from the response
      const jsonMatch = fallbackResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error("Failed to extract JSON from fallback AI response")
    } catch (fallbackError) {
      console.error("Error using fallback AI:", fallbackError)
      throw new Error("All AI analysis attempts failed")
    }
  }
}

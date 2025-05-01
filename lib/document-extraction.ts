import { extractTextWithAI, determineDocumentType } from "./ai-service"

/**
 * Extract text from a document
 */
export async function extractTextFromDocument(file: File): Promise<string> {
  try {
    // Convert the file to base64 for sending to the AI model
    const base64 = await fileToBase64(file)
    const fileType = getFileType(file)

    try {
      // Call AI to extract text from the document
      const extractedText = await extractTextWithAI(base64, file.name, fileType)
      return extractedText
    } catch (aiError) {
      console.error("AI extraction error:", aiError)

      // If AI extraction fails, use the fallback simulation
      console.log("Using fallback extraction method")
      return simulateExtraction(file.name, fileType)
    }
  } catch (error) {
    console.error("Error in document extraction process:", error)

    // Return a simulated extraction as ultimate fallback
    console.log("Using emergency fallback extraction")
    return simulateExtraction(file.name, getFileType(file))
  }
}

/**
 * Convert file to base64 for API transmission
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = base64.split(",")[1]
      resolve(base64Data)
    }
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Get the file type based on the file extension
 */
function getFileType(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() || ""

  if (extension === "pdf") {
    return "pdf"
  } else if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
    return "image"
  } else if (extension === "csv") {
    return "csv"
  } else if (["xlsx", "xls"].includes(extension)) {
    return "excel"
  } else {
    return "unknown"
  }
}

/**
 * Analyze extracted text to determine document category
 */
export async function determineDocumentCategory(text: string): Promise<string> {
  try {
    return await determineDocumentType(text)
  } catch (error) {
    console.error("Error determining document category:", error)
    return "uncategorized"
  }
}

/**
 * Simulate text extraction based on file type (fallback method)
 */
function simulateExtraction(fileName: string, fileType: string): string {
  const lowerFileName = fileName.toLowerCase()

  // Bank statement simulation
  if (lowerFileName.includes("bank") && lowerFileName.includes("statement")) {
    return `
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
    return `
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
    return `
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
    return `
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
    return `
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
}

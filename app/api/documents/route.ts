import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { extractTextFromDocument, determineDocumentCategory } from "@/lib/document-extraction"
import { sql, ensureTableExists } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a unique ID for the document
    const documentId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Extract text from the document
    let extractedText = ""
    let note = ""
    let usingFallback = false

    try {
      extractedText = await extractTextFromDocument(file)
    } catch (extractionError) {
      console.error("Error extracting text:", extractionError)

      // Use a simple fallback if text extraction fails
      extractedText = `[Unable to extract text from ${file.name}. Please try again later.]`
      note = "Using fallback extraction due to service limitations."
      usingFallback = true
    }

    // Determine document category based on extracted text
    let category = "uncategorized"
    try {
      category = await determineDocumentCategory(extractedText)
    } catch (categoryError) {
      console.error("Error determining category:", categoryError)
    }

    // Store the file in Vercel Blob if the token is available
    let url = ""
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`documents/${documentId}-${file.name}`, file, {
          access: "public",
        })
        url = blob.url
      } else {
        // Use a placeholder URL if Blob storage is not available
        url = `/placeholder.svg?height=800&width=600&query=Document: ${encodeURIComponent(file.name)}`
        note = (note || "") + " Using placeholder URL due to missing Blob storage configuration."
      }
    } catch (blobError) {
      console.error("Error storing file in Blob:", blobError)
      url = `/placeholder.svg?height=800&width=600&query=Document: ${encodeURIComponent(file.name)}`
      note = (note || "") + " Using placeholder URL due to Blob storage error."
    }

    // Ensure the documents table exists before inserting
    try {
      const tableCheck = await ensureTableExists("documents")
      if (!tableCheck.success) {
        console.warn("Could not ensure documents table exists:", tableCheck.error || tableCheck.message)
      }
    } catch (tableError) {
      console.error("Error checking/creating documents table:", tableError)
    }

    // Store document metadata in the database
    try {
      await sql`
        INSERT INTO documents (
          id, name, type, size, upload_date, url, status, category, extracted_text, note
        ) VALUES (
          ${documentId}, 
          ${file.name}, 
          ${file.type || getFileTypeFromName(file.name)}, 
          ${file.size}, 
          ${new Date().toISOString()}, 
          ${url}, 
          ${usingFallback ? "fallback" : "analyzed"}, 
          ${category}, 
          ${extractedText},
          ${note || null}
        )
      `
    } catch (dbError) {
      console.error("Error storing document in database:", dbError)
      // Continue even if database storage fails
      note = (note || "") + " Document metadata could not be stored in the database."
    }

    // Return the document data
    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        name: file.name,
        type: getFileTypeFromName(file.name),
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: url,
        status: usingFallback ? "fallback" : "analyzed",
        category: category,
        extractedText: extractedText,
        note: note || undefined,
      },
    })
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Helper function to determine file type from file name
function getFileTypeFromName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

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

export async function GET() {
  try {
    // Ensure the documents table exists
    await ensureTableExists("documents")

    // Fetch documents from the database
    const documents = await sql`SELECT * FROM documents ORDER BY upload_date DESC`

    return NextResponse.json({ success: true, documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch documents",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Ensure the documents table exists
    await ensureTableExists("documents")

    // Delete the document from the database
    await sql`DELETE FROM documents WHERE id = ${id}`

    return NextResponse.json({ success: true, message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

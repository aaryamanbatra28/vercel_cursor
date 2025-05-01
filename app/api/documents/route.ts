import { NextResponse } from "next/server"
import { extractTextFromDocument, determineDocumentCategory } from "@/lib/document-extraction"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload file to Vercel Blob with a random suffix to ensure unique filenames
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true, // Add this line to ensure unique filenames
    })

    // Extract text from the document using Grok
    let extractedText = ""
    try {
      extractedText = await extractTextFromDocument(file)
    } catch (extractError) {
      console.error("Error extracting text:", extractError)
      extractedText = "Text extraction failed. You can try analyzing the document directly."
    }

    // Determine document category based on extracted text
    const category = determineDocumentCategory(extractedText)

    // Create document object
    const document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: getDocumentType(file),
      size: file.size,
      uploadDate: new Date().toISOString(),
      url: blob.url,
      status: extractedText ? "pending" : "error",
      category,
      extractedText,
    }

    // In a real app, you would store the document in a database

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // In a real app, you would fetch documents from a database
    // For now, return an empty array
    return NextResponse.json({ documents: [] })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // In a real app, you would delete the document from storage and database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}

function getDocumentType(file: File): string {
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

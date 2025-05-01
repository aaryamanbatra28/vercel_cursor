import { NextResponse } from "next/server"
import { extractTextWithAI } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { fileName, fileType, base64Data, prompt } = await request.json()

    if (!base64Data) {
      return NextResponse.json({ error: "No document data provided" }, { status: 400 })
    }

    try {
      // Extract text from the document using AI
      const extractedText = await extractTextWithAI(base64Data, fileName, fileType)
      return NextResponse.json({ success: true, extractedText })
    } catch (aiError) {
      console.error("AI extraction error in API route:", aiError)

      // If AI extraction fails, use the fallback simulation from the ai-service
      const fallbackText = await Promise.resolve(`
[FALLBACK EXTRACTION]
This is simulated text for ${fileName} (${fileType}).
The AI service encountered an error: ${aiError instanceof Error ? aiError.message : String(aiError)}

Sample content based on file type:
${fileType === "pdf" ? "PDF document content..." : ""}
${fileType === "image" ? "Image OCR content..." : ""}
${fileType === "csv" || fileType === "excel" ? "Spreadsheet data..." : ""}
${fileType === "unknown" ? "Unknown document content..." : ""}

Note: This is a fallback response due to AI service limitations.
      `)

      return NextResponse.json({
        success: true,
        extractedText: fallbackText,
        note: "Used fallback extraction due to AI service limitations.",
      })
    }
  } catch (error) {
    console.error("Error in extract-text API route:", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { analyzeDocumentWithAI } from "@/lib/ai-service"
import { sql } from "@/lib/database"

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
    const analysis = await analyzeDocumentWithAI(documentId, extractedText)

    // Store the analysis in the database
    try {
      // First, check if we already have an analysis for this document
      const existingAnalysis = await sql`
        SELECT id FROM document_analyses WHERE document_id = ${documentId}
      `

      if (existingAnalysis.length > 0) {
        // Update existing analysis
        await sql`
          UPDATE document_analyses
          SET 
            document_type = ${analysis.documentType},
            confidence = ${analysis.confidence},
            extracted_data = ${JSON.stringify(analysis.extractedData)},
            suggested_actions = ${JSON.stringify(analysis.suggestedActions)},
            updated_at = NOW()
          WHERE document_id = ${documentId}
        `
      } else {
        // Insert new analysis
        await sql`
          INSERT INTO document_analyses (
            document_id, 
            document_type, 
            confidence, 
            extracted_data, 
            suggested_actions
          ) VALUES (
            ${documentId},
            ${analysis.documentType},
            ${analysis.confidence},
            ${JSON.stringify(analysis.extractedData)},
            ${JSON.stringify(analysis.suggestedActions)}
          )
        `
      }

      // Store transactions if any
      if (analysis.transactions && analysis.transactions.length > 0) {
        // First, delete any existing transactions for this document
        await sql`
          DELETE FROM transactions WHERE document_id = ${documentId}
        `

        // Then insert the new transactions
        for (const transaction of analysis.transactions) {
          await sql`
            INSERT INTO transactions (
              document_id,
              date,
              description,
              amount,
              transaction_type
            ) VALUES (
              ${documentId},
              ${transaction.date},
              ${transaction.description},
              ${transaction.amount},
              ${transaction.type}
            )
          `
        }
      }
    } catch (dbError) {
      console.error("Error storing analysis in database:", dbError)
      // Continue with the response even if database storage fails
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error("Error analyzing document:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}

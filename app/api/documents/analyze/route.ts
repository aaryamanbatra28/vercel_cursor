import { NextResponse } from "next/server"
import { analyzeDocument, getDocumentAnalysis } from "@/lib/document-service"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 })
    }

    const analysis = await analyzeDocument(id)

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error("Error analyzing document:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 })
    }

    const analysis = await getDocumentAnalysis(id)

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error fetching document analysis:", error)
    return NextResponse.json({ error: "Failed to fetch document analysis" }, { status: 500 })
  }
}

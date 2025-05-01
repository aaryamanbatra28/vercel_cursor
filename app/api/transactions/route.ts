import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const transactions = await sql`
      SELECT * FROM transactions 
      ORDER BY date DESC
    `

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, description, amount, account_code, transaction_type, source_document } = body

    const result = await sql`
      INSERT INTO transactions (date, description, amount, account_code, transaction_type, source_document)
      VALUES (${date}, ${description}, ${amount}, ${account_code}, ${transaction_type}, ${source_document})
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: "Transaction created successfully",
      id: result[0].id,
    })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create transaction",
      },
      { status: 500 },
    )
  }
}

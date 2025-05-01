import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { generateJournalEntriesWithAI } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionData } = body

    // Generate journal entries using AI
    const result = await generateJournalEntriesWithAI(transactionData)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating journal entries:", error)
    return NextResponse.json({ success: false, error: "Failed to generate journal entries" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { journalEntries } = body

    // Start a transaction
    const client = await sql.begin()

    try {
      // Insert the journal entry header
      const journalResult = await client`
        INSERT INTO journal_entries (description, reference, status) 
        VALUES (${journalEntries.description}, ${journalEntries.reference || null}, 'approved')
        RETURNING id
      `

      const journalId = journalResult[0].id

      // Insert each line item
      for (const entry of journalEntries.entries) {
        await client`
          INSERT INTO journal_entry_lines 
          (journal_entry_id, account_id, account_name, description, debit, credit) 
          VALUES (
            ${journalId}, 
            ${entry.accountId}, 
            ${entry.accountName}, 
            ${entry.description || null}, 
            ${entry.debit || 0}, 
            ${entry.credit || 0}
          )
        `
      }

      // Commit the transaction
      await client.commit()

      return NextResponse.json({
        success: true,
        message: "Journal entries posted successfully",
        reference: `JE-${journalId}`,
      })
    } catch (error) {
      // Rollback on error
      await client.rollback()
      throw error
    }
  } catch (error) {
    console.error("Error posting journal entries:", error)
    return NextResponse.json({ success: false, error: "Failed to post journal entries" }, { status: 500 })
  }
}

// Get all journal entries
export async function GET() {
  try {
    const journalEntries = await sql`
      SELECT je.id, je.date, je.description, je.reference, je.status,
        (SELECT json_agg(json_build_object(
          'account_id', jel.account_id,
          'account_name', jel.account_name,
          'description', jel.description,
          'debit', jel.debit,
          'credit', jel.credit
        ))
        FROM journal_entry_lines jel
        WHERE jel.journal_entry_id = je.id) as entries
      FROM journal_entries je
      ORDER BY je.date DESC
    `

    return NextResponse.json({ success: true, journalEntries })
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

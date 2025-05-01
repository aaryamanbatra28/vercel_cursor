import { neon } from "@neondatabase/serverless"

// Create a SQL client with the pooled connection
export const sql = neon(process.env.DATABASE_URL!)

// Test the database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error: String(error) }
  }
}

// Initialize the database schema
export async function initializeDatabase() {
  try {
    // Create documents table
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        category TEXT,
        extracted_text TEXT,
        note TEXT
      )
    `

    // Create document_analyses table
    await sql`
      CREATE TABLE IF NOT EXISTS document_analyses (
        id SERIAL PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        confidence FLOAT NOT NULL,
        extracted_data JSONB NOT NULL,
        suggested_actions JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        amount FLOAT NOT NULL,
        transaction_type TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create journal_entries table
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        description TEXT NOT NULL,
        reference TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create journal_entry_lines table
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entry_lines (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_id TEXT NOT NULL,
        account_name TEXT NOT NULL,
        description TEXT,
        debit FLOAT NOT NULL DEFAULT 0,
        credit FLOAT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    return { success: true, message: "Database schema initialized successfully" }
  } catch (error) {
    console.error("Database initialization error:", error)
    return { success: false, error: String(error) }
  }
}

// Ensure a specific table exists
export async function ensureTableExists(tableName: string) {
  try {
    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `

    if (!tableExists[0].exists) {
      console.log(`Table ${tableName} does not exist. Initializing database...`)
      // Initialize the database if the table doesn't exist
      const initResult = await initializeDatabase()

      if (!initResult.success) {
        return {
          success: false,
          message: `Failed to create table ${tableName}`,
          error: initResult.error,
        }
      }

      // Verify the table was created
      const verifyTable = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        )
      `

      if (!verifyTable[0].exists) {
        return {
          success: false,
          message: `Table ${tableName} still does not exist after initialization`,
        }
      }
    }

    return { success: true, message: `Table ${tableName} exists` }
  } catch (error) {
    console.error(`Error ensuring table ${tableName} exists:`, error)
    return { success: false, error: String(error) }
  }
}

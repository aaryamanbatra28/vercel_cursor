import { neon } from "@neondatabase/serverless"

// Create a SQL client for use in Server Components, API Routes, etc.
export const sql = neon(process.env.DATABASE_URL!)

// Function to test the database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error: String(error) }
  }
}

// Function to initialize the database schema if not exists
export async function initializeDatabase() {
  try {
    // Create documents table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        size BIGINT NOT NULL,
        upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        url TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        category VARCHAR(50) NOT NULL DEFAULT 'uncategorized',
        extracted_text TEXT,
        note TEXT
      )
    `

    // Create document_analyses table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS document_analyses (
        id SERIAL PRIMARY KEY,
        document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        confidence FLOAT NOT NULL,
        extracted_data JSONB NOT NULL,
        suggested_actions JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create transactions table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        document_id VARCHAR(50) REFERENCES documents(id) ON DELETE CASCADE,
        date VARCHAR(20) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create journal_entries table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        description TEXT NOT NULL,
        reference VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending'
      )
    `

    // Create journal_entry_lines table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entry_lines (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_id VARCHAR(20) NOT NULL,
        account_name VARCHAR(100) NOT NULL,
        description TEXT,
        debit DECIMAL(10, 2) DEFAULT 0,
        credit DECIMAL(10, 2) DEFAULT 0
      )
    `

    return { success: true }
  } catch (error) {
    console.error("Database initialization error:", error)
    return { success: false, error: String(error) }
  }
}

// Function to ensure a specific table exists
export async function ensureTableExists(tableName: string) {
  try {
    // Check if the table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as exists
    `

    if (!result[0]?.exists) {
      // If the table doesn't exist, run the initialization
      await initializeDatabase()

      // Verify the table was created
      const verifyResult = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        ) as exists
      `

      return {
        success: verifyResult[0]?.exists,
        message: verifyResult[0]?.exists
          ? `Table ${tableName} created successfully`
          : `Failed to create table ${tableName}`,
      }
    }

    return { success: true, message: `Table ${tableName} already exists` }
  } catch (error) {
    console.error(`Error ensuring table ${tableName} exists:`, error)
    return { success: false, error: String(error) }
  }
}

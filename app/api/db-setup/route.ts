import { NextResponse } from "next/server"
import { initializeDatabase, testConnection } from "@/lib/database"

export async function GET() {
  try {
    // Test the database connection
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Initialize the database schema
    const initResult = await initializeDatabase()

    if (!initResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database initialization failed",
          details: initResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful and schema initialized",
      connectionTest,
      initResult,
    })
  } catch (error) {
    console.error("Error in database setup:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database setup failed",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

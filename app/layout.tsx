import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataProvider } from "@/contexts/data-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinanceAI - Financial Controller Platform",
  description: "AI-powered financial controller platform",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataProvider>
          {/* Header with Navigation */}
          <header className="border-b sticky top-0 z-50 bg-background">
            <div className="container flex h-16 items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">FinanceAI</h1>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/journals" className="text-sm font-medium hover:text-primary">
                  Journals
                </Link>
                <Link href="/general-ledger" className="text-sm font-medium hover:text-primary">
                  General Ledger
                </Link>
                <Link href="/reports" className="text-sm font-medium hover:text-primary">
                  Reports
                </Link>
                <Link href="/documents" className="text-sm font-medium hover:text-primary">
                  Documents
                </Link>
                <Link href="/analysis" className="text-sm font-medium hover:text-primary">
                  Analysis
                </Link>
                <Link href="/insights" className="text-sm font-medium hover:text-primary">
                  Insights
                </Link>
                <Link href="/settings" className="text-sm font-medium hover:text-primary">
                  Settings
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  April 2025
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  JD
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>{children}</main>
        </DataProvider>
      </body>
    </html>
  )
}

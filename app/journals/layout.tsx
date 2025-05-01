import type React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function JournalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
            <p className="text-muted-foreground">Review and manage your financial transactions</p>
          </div>
        </div>

        <div className="border-b pb-2">
          <nav className="flex space-x-4">
            <Link href="/journals" className="journal-tab">
              Pending Review
              <Badge className="ml-2 bg-amber-500/20 text-amber-700 hover:bg-amber-500/20">12</Badge>
            </Link>
            <Link href="/journals/approved" className="journal-tab">
              Approved
            </Link>
            <Link href="/journals/suggest" className="journal-tab">
              AI Suggestions
            </Link>
            <Link href="/journals/all" className="journal-tab">
              All Entries
            </Link>
          </nav>
        </div>

        {children}
      </div>
    </div>
  )
}

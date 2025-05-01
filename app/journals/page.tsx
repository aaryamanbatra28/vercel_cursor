"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Check, Download, Edit, Filter, Plus, Search, Upload } from "lucide-react"
import { usePathname } from "next/navigation"
import { useData } from "@/contexts/data-context"
import type { Transaction } from "@/types/documents"

// Mock data for chart of accounts
const chartOfAccounts = [
  { id: "1000", name: "Cash", type: "Asset" },
  { id: "1200", name: "Accounts Receivable", type: "Asset" },
  { id: "2000", name: "Accounts Payable", type: "Liability" },
  { id: "4000", name: "Service Revenue", type: "Revenue" },
  { id: "6500", name: "Cloud Services Expense", type: "Expense" },
]

export default function JournalsPage() {
  const pathname = usePathname()
  const [editingEntry, setEditingEntry] = useState<any>(null)
  const { transactions } = useData()

  // Set the current tab in the layout
  useEffect(() => {
    const tabs = document.querySelectorAll(".journal-tab")
    tabs.forEach((tab) => {
      const href = (tab as HTMLAnchorElement).getAttribute("href")
      if (href === pathname) {
        tab.setAttribute("aria-current", "page")
      } else {
        tab.removeAttribute("aria-current")
      }
    })
  }, [pathname])

  // Group transactions by document and date
  const groupTransactions = (transactions: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {}

    transactions.forEach((tx) => {
      const key = `${tx.documentId}-${tx.date}-${tx.description}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(tx)
    })

    return Object.values(groups)
  }

  // Convert transactions to journal entries
  const transactionGroups = groupTransactions(transactions)

  // Sample journal entries for demonstration when no real data exists
  const sampleJournalEntries = [
    {
      id: "je-001",
      description: "Stripe Payout - Enterprise Plan",
      date: "Apr 15, 2025",
      reference: "STR-12345",
      entries: [
        {
          accountId: "1000",
          accountName: "Cash",
          debit: 24500,
          credit: 0,
        },
        {
          accountId: "4000",
          accountName: "Service Revenue",
          debit: 0,
          credit: 24500,
        },
      ],
    },
    {
      id: "je-002",
      description: "AWS Monthly Services",
      date: "Apr 14, 2025",
      reference: "AWS-5678",
      entries: [
        {
          accountId: "6500",
          accountName: "Cloud Services Expense",
          debit: 8750,
          credit: 0,
        },
        {
          accountId: "2000",
          accountName: "Accounts Payable",
          debit: 0,
          credit: 8750,
        },
      ],
    },
  ]

  // Use real transaction data if available, otherwise use sample data
  const displayEntries =
    transactionGroups.length > 0
      ? transactionGroups.map((group, index) => {
          // Create a journal entry from the transaction group
          const firstTx = group[0]
          return {
            id: `je-${index}`,
            description: firstTx.description,
            date: firstTx.date,
            reference: firstTx.documentId,
            entries: group.flatMap((tx) => {
              // Convert transaction to journal entry
              if (tx.type === "deposit" || tx.type === "income") {
                return [
                  {
                    accountId: "1000",
                    accountName: "Cash",
                    debit: Math.abs(tx.amount),
                    credit: 0,
                  },
                  {
                    accountId: "4000",
                    accountName: "Service Revenue",
                    debit: 0,
                    credit: Math.abs(tx.amount),
                  },
                ]
              } else {
                return [
                  {
                    accountId: "6500",
                    accountName: "Cloud Services Expense",
                    debit: Math.abs(tx.amount),
                    credit: 0,
                  },
                  {
                    accountId: "2000",
                    accountName: "Accounts Payable",
                    debit: 0,
                    credit: Math.abs(tx.amount),
                  },
                ]
              }
            }),
          }
        })
      : sampleJournalEntries

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search journals..." className="w-full md:w-[240px] pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Journal
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>AI-Generated Journal Entries</CardTitle>
          <CardDescription>Review and approve journal entries generated by AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-8 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div className="col-span-2">Description</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Reference</div>
              <div className="col-span-1">Account</div>
              <div className="col-span-1 text-right">Debit</div>
              <div className="col-span-1 text-right">Credit</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {displayEntries.map((journalEntry) => (
              <div key={journalEntry.id}>
                <div className="px-4 py-3 border-b bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 hover:bg-primary/10">
                        {journalEntry.description.includes("Revenue") ? "Revenue Recognition" : "Expense"}
                      </Badge>
                      <span className="text-sm font-medium">{journalEntry.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
                        AI Generated
                      </Badge>
                      <Button variant="outline" size="sm" className="h-7">
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Approve All
                      </Button>
                      <Button variant="outline" size="sm" className="h-7">
                        <Edit className="mr-1 h-3.5 w-3.5" />
                        Edit Group
                      </Button>
                    </div>
                  </div>
                </div>

                {journalEntry.entries.map((entry, index) => (
                  <div key={`${journalEntry.id}-${index}`} className="grid grid-cols-8 border-b px-4 py-3 text-sm">
                    <div className="col-span-2">{journalEntry.description}</div>
                    <div className="col-span-1">{journalEntry.date}</div>
                    <div className="col-span-1">{journalEntry.reference}</div>
                    <div className="col-span-1">{entry.accountName}</div>
                    <div className="col-span-1 text-right">{entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : "-"}</div>
                    <div className="col-span-1 text-right">
                      {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : "-"}
                    </div>
                    <div className="col-span-1 text-right">
                      <Button variant="ghost" size="sm" className="h-7" onClick={() => setEditingEntry(entry)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}

                {/* AI Explanation Card */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/20 p-1.5 mt-0.5">
                      <svg
                        className="h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 19v-2" />
                        <path d="M12 7V5" />
                        <path d="M5 12H3" />
                        <path d="M21 12h-2" />
                        <path d="m18.7 5.3-1.4 1.4" />
                        <path d="m6.7 17.3-1.4 1.4" />
                        <path d="m18.7 18.7-1.4-1.4" />
                        <path d="m6.7 6.7-1.4-1.4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">AI Explanation</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {journalEntry.description.includes("AWS")
                          ? "I've classified the AWS charge as a Cloud Expense based on the vendor name and historical transaction patterns. This is consistent with your chart of accounts where AWS services are typically categorized under Operating Expenses > Technology > Cloud Services."
                          : "I've classified this as revenue based on the transaction description and amount. This follows your historical pattern of categorizing similar transactions to this account."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {displayEntries.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p>No journal entries found. Upload documents to generate entries.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Entry Dialog */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Journal Entry</DialogTitle>
              <DialogDescription>
                Make changes to the journal entry. Ensure debits and credits remain balanced.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-right text-sm font-medium">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={editingEntry.date}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="reference" className="text-right text-sm font-medium">
                  Reference
                </label>
                <Input
                  id="reference"
                  className="col-span-3"
                  value={editingEntry.reference}
                  onChange={(e) => setEditingEntry({ ...editingEntry, reference: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="account" className="text-right text-sm font-medium">
                  Account
                </label>
                <Select
                  value={editingEntry.accountId}
                  onValueChange={(value) => {
                    const account = chartOfAccounts.find((a) => a.id === value)
                    setEditingEntry({
                      ...editingEntry,
                      accountId: value,
                      accountName: account?.name || "",
                    })
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartOfAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="debit" className="text-right text-sm font-medium">
                  Debit
                </label>
                <Input
                  id="debit"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={editingEntry.debit || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    setEditingEntry({
                      ...editingEntry,
                      debit: value,
                      // If debit has a value, credit should be 0
                      credit: value > 0 ? 0 : editingEntry.credit,
                    })
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="credit" className="text-right text-sm font-medium">
                  Credit
                </label>
                <Input
                  id="credit"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={editingEntry.credit || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    setEditingEntry({
                      ...editingEntry,
                      credit: value,
                      // If credit has a value, debit should be 0
                      debit: value > 0 ? 0 : editingEntry.debit,
                    })
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
              <Button onClick={() => setEditingEntry(null)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

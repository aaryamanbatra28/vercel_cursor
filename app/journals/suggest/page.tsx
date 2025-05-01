"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Check, Edit, Plus, Sparkles, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePathname } from "next/navigation"

// Mock data for chart of accounts
const chartOfAccounts = [
  { id: "1000", name: "Cash", type: "Asset" },
  { id: "1200", name: "Accounts Receivable", type: "Asset" },
  { id: "1500", name: "Office Equipment", type: "Asset" },
  { id: "2000", name: "Accounts Payable", type: "Liability" },
  { id: "2100", name: "Accrued Expenses", type: "Liability" },
  { id: "3000", name: "Common Stock", type: "Equity" },
  { id: "3100", name: "Retained Earnings", type: "Equity" },
  { id: "4000", name: "Service Revenue", type: "Revenue" },
  { id: "4100", name: "Product Revenue", type: "Revenue" },
  { id: "5000", name: "Cost of Goods Sold", type: "Expense" },
  { id: "6000", name: "Advertising Expense", type: "Expense" },
  { id: "6100", name: "Office Supplies", type: "Expense" },
  { id: "6200", name: "Rent Expense", type: "Expense" },
  { id: "6300", name: "Utilities Expense", type: "Expense" },
  { id: "6400", name: "Salaries Expense", type: "Expense" },
  { id: "6500", name: "Cloud Services Expense", type: "Expense" },
]

// Mock transaction data that would come from bank feeds, invoices, etc.
const transactionData = [
  {
    id: "tx-001",
    date: "2025-04-15",
    description: "AWS Monthly Services",
    amount: 8750.0,
    vendor: "Amazon Web Services",
    category: "Technology",
    status: "pending",
  },
  {
    id: "tx-002",
    date: "2025-04-14",
    description: "Office Rent Payment",
    amount: 12500.0,
    vendor: "Skyline Properties",
    category: "Facilities",
    status: "pending",
  },
  {
    id: "tx-003",
    date: "2025-04-12",
    description: "Customer Payment - Acme Corp",
    amount: 45000.0,
    vendor: "Acme Corporation",
    category: "Income",
    status: "pending",
  },
]

// Mock AI-suggested journal entries
const suggestedEntries = {
  "tx-001": [
    {
      id: "je-001-1",
      accountId: "6500",
      accountName: "Cloud Services Expense",
      description: "AWS Monthly Services",
      debit: 8750.0,
      credit: 0,
      confidence: 0.95,
    },
    {
      id: "je-001-2",
      accountId: "2000",
      accountName: "Accounts Payable",
      description: "AWS Monthly Services",
      debit: 0,
      credit: 8750.0,
      confidence: 0.95,
    },
  ],
  "tx-002": [
    {
      id: "je-002-1",
      accountId: "6200",
      accountName: "Rent Expense",
      description: "Office Rent Payment",
      debit: 12500.0,
      credit: 0,
      confidence: 0.98,
    },
    {
      id: "je-002-2",
      accountId: "1000",
      accountName: "Cash",
      description: "Office Rent Payment",
      debit: 0,
      credit: 12500.0,
      confidence: 0.98,
    },
  ],
  "tx-003": [
    {
      id: "je-003-1",
      accountId: "1000",
      accountName: "Cash",
      description: "Customer Payment - Acme Corp",
      debit: 45000.0,
      credit: 0,
      confidence: 0.92,
    },
    {
      id: "je-003-2",
      accountId: "1200",
      accountName: "Accounts Receivable",
      description: "Customer Payment - Acme Corp",
      debit: 0,
      credit: 45000.0,
      confidence: 0.89,
    },
  ],
}

// Mock AI explanations for journal entries
const aiExplanations = {
  "tx-001":
    "I've classified this as Cloud Services Expense based on the vendor (AWS) and description. This follows your historical pattern of categorizing AWS charges to this account. The transaction is set as a payable since it appears to be an invoice rather than an immediate payment.",
  "tx-002":
    "This is categorized as Rent Expense based on the vendor name (Skyline Properties) and the description containing 'Rent Payment'. The transaction appears to be a direct payment from your cash account based on the transaction type.",
  "tx-003":
    "This appears to be a customer payment from Acme Corporation. Based on your accounts receivable records, this likely represents collection of an outstanding invoice, so I've credited Accounts Receivable and debited Cash.",
}

// Mock function to simulate AI generating journal entries
const generateJournalEntries = async (transactionId: string) => {
  // In a real implementation, this would call an API that uses an LLM
  // to analyze the transaction and suggest appropriate journal entries
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(suggestedEntries[transactionId as keyof typeof suggestedEntries])
    }, 1500)
  })
}

// Mock function to validate journal entries
const validateJournalEntries = (entries: any[]) => {
  // Calculate total debits and credits
  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0)

  // Check if debits equal credits (allowing for small floating point differences)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return {
    isValid: isBalanced,
    totalDebit,
    totalCredit,
    difference: totalDebit - totalCredit,
  }
}

// Mock function to post to ledger
const postToLedger = async (entries: any[]) => {
  // In a real implementation, this would call an API to post to your accounting system
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Journal entries posted successfully" })
    }, 2000)
  })
}

export default function JournalSuggestPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [journalEntries, setJournalEntries] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const pathname = usePathname()

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

  // Function to handle generating journal entries for a transaction
  const handleGenerateEntries = async (transactionId: string) => {
    setSelectedTransaction(transactionId)
    setIsGenerating(true)

    try {
      const entries = await generateJournalEntries(transactionId)
      setJournalEntries({
        ...journalEntries,
        [transactionId]: entries,
      })
      toast({
        title: "Journal entries generated",
        description: "AI has suggested journal entries based on the transaction data.",
      })
    } catch (error) {
      toast({
        title: "Error generating entries",
        description: "There was a problem generating journal entries.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Function to handle posting journal entries to the ledger
  const handlePostToLedger = async (transactionId: string) => {
    setIsPosting(true)

    try {
      const entries = journalEntries[transactionId]
      const validation = validateJournalEntries(entries)

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: `Journal entries are not balanced. Difference: ${validation.difference.toFixed(2)}`,
          variant: "destructive",
        })
        setIsPosting(false)
        return
      }

      const result = await postToLedger(entries)
      toast({
        title: "Success",
        description: "Journal entries have been posted to the ledger.",
      })

      // Update the transaction status
      const updatedTransactions = transactionData.map((tx) =>
        tx.id === transactionId ? { ...tx, status: "posted" } : tx,
      )

      // In a real app, you would update the state with the new transaction data
      setShowConfirmDialog(false)
    } catch (error) {
      toast({
        title: "Error posting entries",
        description: "There was a problem posting the journal entries to the ledger.",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
      setShowConfirmDialog(false)
    }
  }

  // Function to handle updating a journal entry
  const handleUpdateEntry = (entry: any) => {
    if (!selectedTransaction) return

    const updatedEntries = journalEntries[selectedTransaction].map((e: any) => (e.id === entry.id ? entry : e))

    setJournalEntries({
      ...journalEntries,
      [selectedTransaction]: updatedEntries,
    })

    setEditingEntry(null)
  }

  // Get the current transaction
  const currentTransaction = transactionData.find((tx) => tx.id === selectedTransaction)

  // Get the current journal entries
  const currentEntries = selectedTransaction ? journalEntries[selectedTransaction] : []

  // Validate the current entries
  const validation = currentEntries ? validateJournalEntries(currentEntries) : { isValid: false }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-auto">
            <Input type="search" placeholder="Search transactions..." className="w-full md:w-[240px]" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Journal Entry
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Transactions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>Transactions awaiting journal entry creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionData.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTransaction === transaction.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedTransaction(transaction.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{transaction.description}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <Badge variant={transaction.status === "posted" ? "outline" : "secondary"}>
                      {transaction.status === "posted" ? "Posted" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">${transaction.amount.toFixed(2)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isGenerating || transaction.status === "posted"}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateEntries(transaction.id)
                      }}
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      {journalEntries[transaction.id] ? "Regenerate" : "Suggest Entries"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journal Entries Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Journal Entries</CardTitle>
            <CardDescription>
              {currentTransaction
                ? `Suggested entries for ${currentTransaction.description}`
                : "Select a transaction to view suggested journal entries"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedTransaction && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Select a transaction from the left panel to view suggested journal entries</p>
              </div>
            )}

            {selectedTransaction && !journalEntries[selectedTransaction] && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Click "Suggest Entries" to generate AI-powered journal entries for this transaction</p>
              </div>
            )}

            {selectedTransaction && journalEntries[selectedTransaction] && (
              <>
                {/* AI Explanation Card */}
                <Alert className="mb-6 bg-primary/5 border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <AlertTitle>AI Explanation</AlertTitle>
                  <AlertDescription>
                    {aiExplanations[selectedTransaction as keyof typeof aiExplanations]}
                  </AlertDescription>
                </Alert>

                {/* Journal Entry Table */}
                <Table className="border rounded-md">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[250px]">Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries[selectedTransaction].map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.accountName}
                          <div className="text-xs text-muted-foreground">{entry.accountId}</div>
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? `${entry.debit.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? `${entry.credit.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Totals Row */}
                    <TableRow className="bg-muted/30 font-medium">
                      <TableCell colSpan={2} className="text-right">
                        Totals
                      </TableCell>
                      <TableCell className="text-right">${validation.totalDebit?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell className="text-right">${validation.totalCredit?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Validation Status */}
                {validation.isValid ? (
                  <div className="flex items-center gap-2 mt-4 text-sm text-emerald-600">
                    <Check className="h-4 w-4" />
                    <span>Journal entries are balanced</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-4 text-sm text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Journal entries are not balanced. Difference: ${(validation.difference || 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
          {selectedTransaction && journalEntries[selectedTransaction] && (
            <CardFooter className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline">Add Line Item</Button>
              <Button disabled={!validation.isValid || isPosting} onClick={() => setShowConfirmDialog(true)}>
                {isPosting ? "Posting..." : "Post to Ledger"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

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
                <Label htmlFor="account" className="text-right">
                  Account
                </Label>
                <Select
                  defaultValue={editingEntry.accountId}
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
                    <SelectItem value="" disabled>
                      Select an account
                    </SelectItem>
                    {chartOfAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="debit" className="text-right">
                  Debit
                </Label>
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
                <Label htmlFor="credit" className="text-right">
                  Credit
                </Label>
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
              <Button onClick={() => handleUpdateEntry(editingEntry)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Post Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Journal Entry Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to post these journal entries to the ledger? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isPosting}>
              Cancel
            </Button>
            <Button onClick={() => selectedTransaction && handlePostToLedger(selectedTransaction)} disabled={isPosting}>
              {isPosting ? "Posting..." : "Post to Ledger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

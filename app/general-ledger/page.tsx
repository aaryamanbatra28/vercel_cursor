"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  Search,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock chart of accounts
const chartOfAccounts = [
  { id: "1000", name: "Cash", type: "Asset", normalBalance: "debit" },
  { id: "1200", name: "Accounts Receivable", type: "Asset", normalBalance: "debit" },
  { id: "1500", name: "Office Equipment", type: "Asset", normalBalance: "debit" },
  { id: "2000", name: "Accounts Payable", type: "Liability", normalBalance: "credit" },
  { id: "2100", name: "Accrued Expenses", type: "Liability", normalBalance: "credit" },
  { id: "3000", name: "Common Stock", type: "Equity", normalBalance: "credit" },
  { id: "3100", name: "Retained Earnings", type: "Equity", normalBalance: "credit" },
  { id: "4000", name: "Service Revenue", type: "Revenue", normalBalance: "credit" },
  { id: "4100", name: "Product Revenue", type: "Revenue", normalBalance: "credit" },
  { id: "5000", name: "Cost of Goods Sold", type: "Expense", normalBalance: "debit" },
  { id: "6000", name: "Advertising Expense", type: "Expense", normalBalance: "debit" },
  { id: "6100", name: "Office Supplies", type: "Expense", normalBalance: "debit" },
  { id: "6200", name: "Rent Expense", type: "Expense", normalBalance: "debit" },
  { id: "6300", name: "Utilities Expense", type: "Expense", normalBalance: "debit" },
  { id: "6400", name: "Salaries Expense", type: "Expense", normalBalance: "debit" },
  { id: "6500", name: "Cloud Services Expense", type: "Expense", normalBalance: "debit" },
]

// Mock general ledger entries
const mockLedgerEntries = [
  {
    id: "gl-001",
    date: "2025-04-15",
    journalId: "je-001",
    description: "Stripe Payout - Enterprise Plan",
    accountId: "1000",
    accountName: "Cash",
    debit: 24500,
    credit: 0,
    reference: "STR-12345",
    reconciled: true,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-002",
    date: "2025-04-15",
    journalId: "je-001",
    description: "Stripe Payout - Enterprise Plan",
    accountId: "4000",
    accountName: "Service Revenue",
    debit: 0,
    credit: 24500,
    reference: "STR-12345",
    reconciled: true,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-003",
    date: "2025-04-14",
    journalId: "je-002",
    description: "AWS Monthly Services",
    accountId: "6500",
    accountName: "Cloud Services Expense",
    debit: 8750,
    credit: 0,
    reference: "AWS-5678",
    reconciled: false,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-004",
    date: "2025-04-14",
    journalId: "je-002",
    description: "AWS Monthly Services",
    accountId: "2000",
    accountName: "Accounts Payable",
    debit: 0,
    credit: 8750,
    reference: "AWS-5678",
    reconciled: false,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-005",
    date: "2025-04-10",
    journalId: "je-003",
    description: "Office Rent Payment",
    accountId: "6200",
    accountName: "Rent Expense",
    debit: 12500,
    credit: 0,
    reference: "CHK-1001",
    reconciled: true,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-006",
    date: "2025-04-10",
    journalId: "je-003",
    description: "Office Rent Payment",
    accountId: "1000",
    accountName: "Cash",
    debit: 0,
    credit: 12500,
    reference: "CHK-1001",
    reconciled: true,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-007",
    date: "2025-04-05",
    journalId: "je-004",
    description: "Payroll Processing",
    accountId: "6400",
    accountName: "Salaries Expense",
    debit: 135000,
    credit: 0,
    reference: "PR-4502",
    reconciled: false,
    flagged: true,
    notes: "Amount doesn't match bank statement. Bank shows $134,500.",
  },
  {
    id: "gl-008",
    date: "2025-04-05",
    journalId: "je-004",
    description: "Payroll Processing",
    accountId: "1000",
    accountName: "Cash",
    debit: 0,
    credit: 135000,
    reference: "PR-4502",
    reconciled: false,
    flagged: true,
    notes: "Amount doesn't match bank statement. Bank shows $134,500.",
  },
  {
    id: "gl-009",
    date: "2025-04-03",
    journalId: "je-005",
    description: "Customer Payment - Acme Corp",
    accountId: "1000",
    accountName: "Cash",
    debit: 45000,
    credit: 0,
    reference: "DEP-789",
    reconciled: true,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-010",
    date: "2025-04-03",
    journalId: "je-005",
    description: "Customer Payment - Acme Corp",
    accountId: "1200",
    accountName: "Accounts Receivable",
    debit: 0,
    credit: 45000,
    reference: "DEP-789",
    reconciled: true,
    flagged: false,
    notes: "",
  },
  {
    id: "gl-011",
    date: "2025-04-02",
    journalId: "je-006",
    description: "Office Supplies Purchase",
    accountId: "6100",
    accountName: "Office Supplies",
    debit: 1250,
    credit: 0,
    reference: "CC-456",
    reconciled: false,
    flagged: true,
    notes: "Missing receipt. Need to verify expense category.",
  },
  {
    id: "gl-012",
    date: "2025-04-02",
    journalId: "je-006",
    description: "Office Supplies Purchase",
    accountId: "1000",
    accountName: "Cash",
    debit: 0,
    credit: 1250,
    reference: "CC-456",
    reconciled: false,
    flagged: true,
    notes: "Missing receipt. Need to verify expense category.",
  },
]

// Function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function GeneralLedgerPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("april")
  const [ledgerEntries, setLedgerEntries] = useState(mockLedgerEntries)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showFlagged, setShowFlagged] = useState(false)
  const [showReconciled, setShowReconciled] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null)
  const [showReconcileDialog, setShowReconcileDialog] = useState(false)
  const [reconcileNote, setReconcileNote] = useState("")
  const [isReconciling, setIsReconciling] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [flagNote, setFlagNote] = useState("")
  const [isFlagging, setIsFlagging] = useState(false)

  // Filter ledger entries based on search, account, and flags
  const filteredEntries = ledgerEntries.filter((entry) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accountName.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by account
    const matchesAccount = selectedAccount === null || entry.accountId === selectedAccount

    // Filter by reconciliation status
    const matchesReconciled = !showReconciled || entry.reconciled

    // Filter by flag status
    const matchesFlagged = !showFlagged || entry.flagged

    return matchesSearch && matchesAccount && matchesReconciled && matchesFlagged
  })

  // Group entries by journal ID for better display
  const groupedEntries: Record<string, typeof ledgerEntries> = {}
  filteredEntries.forEach((entry) => {
    if (!groupedEntries[entry.journalId]) {
      groupedEntries[entry.journalId] = []
    }
    groupedEntries[entry.journalId].push(entry)
  })

  // Handle reconciling an entry
  const handleReconcile = () => {
    if (!selectedEntry) return

    setIsReconciling(true)

    // Simulate API call
    setTimeout(() => {
      // Update all entries with the same journal ID
      const journalId = selectedEntry.journalId
      const updatedEntries = ledgerEntries.map((entry) => {
        if (entry.journalId === journalId) {
          return {
            ...entry,
            reconciled: true,
            flagged: false,
            notes: reconcileNote || entry.notes,
          }
        }
        return entry
      })

      setLedgerEntries(updatedEntries)
      setIsReconciling(false)
      setShowReconcileDialog(false)
      setReconcileNote("")

      toast({
        title: "Entry Reconciled",
        description: "The journal entry has been marked as reconciled.",
      })
    }, 1000)
  }

  // Handle flagging an entry
  const handleFlag = () => {
    if (!selectedEntry) return

    setIsFlagging(true)

    // Simulate API call
    setTimeout(() => {
      // Update all entries with the same journal ID
      const journalId = selectedEntry.journalId
      const updatedEntries = ledgerEntries.map((entry) => {
        if (entry.journalId === journalId) {
          return {
            ...entry,
            flagged: true,
            reconciled: false,
            notes: flagNote,
          }
        }
        return entry
      })

      setLedgerEntries(updatedEntries)
      setIsFlagging(false)
      setShowFlagDialog(false)
      setFlagNote("")

      toast({
        title: "Entry Flagged",
        description: "The journal entry has been flagged for review.",
      })
    }, 1000)
  }

  // Calculate account balances
  const calculateAccountBalances = () => {
    const balances: Record<string, number> = {}

    chartOfAccounts.forEach((account) => {
      balances[account.id] = 0
    })

    ledgerEntries.forEach((entry) => {
      const account = chartOfAccounts.find((a) => a.id === entry.accountId)
      if (!account) return

      if (account.normalBalance === "debit") {
        balances[account.id] += entry.debit - entry.credit
      } else {
        balances[account.id] += entry.credit - entry.debit
      }
    })

    return balances
  }

  const accountBalances = calculateAccountBalances()

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
            <p className="text-muted-foreground">View and reconcile all posted journal entries</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 border rounded-md px-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="border-0 p-0 h-9 w-[120px] focus:ring-0">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="april">April 2025</SelectItem>
                  <SelectItem value="march">March 2025</SelectItem>
                  <SelectItem value="february">February 2025</SelectItem>
                  <SelectItem value="january">January 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Reconcile
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ledger" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ledger">Ledger Entries</TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged Items
              <Badge className="ml-2 bg-amber-500/20 text-amber-700 hover:bg-amber-500/20">
                {ledgerEntries.filter((e) => e.flagged).length / 2}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="accounts">Account Balances</TabsTrigger>
          </TabsList>

          <div className="flex justify-between items-center mb-6">
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ledger..."
                  className="w-full md:w-[240px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Select value={selectedAccount || ""} onValueChange={(value) => setSelectedAccount(value || null)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {chartOfAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-flagged"
                  checked={showFlagged}
                  onCheckedChange={(checked) => setShowFlagged(checked as boolean)}
                />
                <Label htmlFor="show-flagged" className="text-sm">
                  Flagged Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-reconciled"
                  checked={showReconciled}
                  onCheckedChange={(checked) => setShowReconciled(checked as boolean)}
                />
                <Label htmlFor="show-reconciled" className="text-sm">
                  Reconciled Only
                </Label>
              </div>
            </div>
          </div>

          <TabsContent value="ledger" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>General Ledger Entries</CardTitle>
                <CardDescription>All journal entries posted to the general ledger</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedEntries).map(([journalId, entries]) => (
                      <TableRow key={journalId} className={entries.some((e) => e.flagged) ? "bg-amber-50" : ""}>
                        <TableCell className="font-medium">{entries[0].date}</TableCell>
                        <TableCell>{entries[0].description}</TableCell>
                        <TableCell>{entries[0].reference}</TableCell>
                        <TableCell colSpan={3}>
                          <div className="space-y-1">
                            {entries.map((entry) => (
                              <div key={entry.id} className="grid grid-cols-3 text-sm py-1">
                                <div>
                                  {entry.accountName} ({entry.accountId})
                                </div>
                                <div className="text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : ""}</div>
                                <div className="text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : ""}</div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entries[0].flagged ? (
                            <Badge className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/20 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Flagged
                            </Badge>
                          ) : entries[0].reconciled ? (
                            <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Reconciled
                            </Badge>
                          ) : (
                            <Badge className="bg-muted hover:bg-muted">Unreconciled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedEntry(entries[0])
                                      setShowReconcileDialog(true)
                                      setReconcileNote(entries[0].notes || "")
                                    }}
                                    disabled={entries[0].reconciled}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Mark as reconciled</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedEntry(entries[0])
                                      setShowFlagDialog(true)
                                      setFlagNote(entries[0].notes || "")
                                    }}
                                    disabled={entries[0].flagged}
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Flag for review</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {Object.keys(groupedEntries).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No ledger entries found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Object.keys(groupedEntries).length} of {Object.keys(mockLedgerEntries).length / 2} journal
                  entries
                </div>
                <Button variant="outline">Load More</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="flagged" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Items</CardTitle>
                <CardDescription>Journal entries that require attention or correction</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedEntries)
                      .filter(([_, entries]) => entries.some((e) => e.flagged))
                      .map(([journalId, entries]) => (
                        <TableRow key={journalId} className="bg-amber-50">
                          <TableCell className="font-medium">{entries[0].date}</TableCell>
                          <TableCell>{entries[0].description}</TableCell>
                          <TableCell>{entries[0].reference}</TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                              <span>{entries[0].notes}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(entries.reduce((sum, entry) => sum + entry.debit, 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEntry(entries[0])
                                  setShowReconcileDialog(true)
                                  setReconcileNote(entries[0].notes || "")
                                }}
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                Resolve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                    {Object.entries(groupedEntries).filter(([_, entries]) => entries.some((e) => e.flagged)).length ===
                      0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No flagged items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Status</CardTitle>
                <CardDescription>Track the reconciliation progress of your accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Reconciliation Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Total Entries</h4>
                          <span className="text-xl font-bold">{Object.keys(mockLedgerEntries).length / 2}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Reconciled</h4>
                          <span className="text-xl font-bold">
                            {ledgerEntries.filter((e) => e.reconciled).length / 2}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${(ledgerEntries.filter((e) => e.reconciled).length / ledgerEntries.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Flagged</h4>
                          <span className="text-xl font-bold">{ledgerEntries.filter((e) => e.flagged).length / 2}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{
                              width: `${(ledgerEntries.filter((e) => e.flagged).length / ledgerEntries.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Reconciliation by Account</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Total Entries</TableHead>
                          <TableHead className="text-right">Reconciled</TableHead>
                          <TableHead className="text-right">Flagged</TableHead>
                          <TableHead className="text-right">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartOfAccounts
                          .filter((account) => ledgerEntries.some((entry) => entry.accountId === account.id))
                          .map((account) => {
                            const accountEntries = ledgerEntries.filter((entry) => entry.accountId === account.id)
                            const totalEntries = accountEntries.length
                            const reconciledEntries = accountEntries.filter((entry) => entry.reconciled).length
                            const flaggedEntries = accountEntries.filter((entry) => entry.flagged).length
                            const progress = totalEntries > 0 ? (reconciledEntries / totalEntries) * 100 : 0

                            return (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium">
                                  {account.name} ({account.id})
                                </TableCell>
                                <TableCell>{account.type}</TableCell>
                                <TableCell className="text-right">{totalEntries}</TableCell>
                                <TableCell className="text-right">{reconciledEntries}</TableCell>
                                <TableCell className="text-right">{flaggedEntries}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-24 bg-muted rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          progress === 100
                                            ? "bg-emerald-500"
                                            : flaggedEntries > 0
                                              ? "bg-amber-500"
                                              : "bg-blue-500"
                                        }`}
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs">{Math.round(progress)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Account Balances</CardTitle>
                <CardDescription>Current balances for all accounts in the general ledger</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Normal Balance</TableHead>
                      <TableHead className="text-right">Current Balance</TableHead>
                      <TableHead className="text-right">Reconciliation Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartOfAccounts
                      .filter((account) => ledgerEntries.some((entry) => entry.accountId === account.id))
                      .map((account) => {
                        const accountEntries = ledgerEntries.filter((entry) => entry.accountId === account.id)
                        const totalEntries = accountEntries.length
                        const reconciledEntries = accountEntries.filter((entry) => entry.reconciled).length
                        const flaggedEntries = accountEntries.filter((entry) => entry.flagged).length
                        const progress = totalEntries > 0 ? (reconciledEntries / totalEntries) * 100 : 0

                        return (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">
                              {account.name} ({account.id})
                            </TableCell>
                            <TableCell>{account.type}</TableCell>
                            <TableCell className="capitalize">{account.normalBalance}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(accountBalances[account.id])}
                            </TableCell>
                            <TableCell className="text-right">
                              {flaggedEntries > 0 ? (
                                <Badge className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/20">
                                  {flaggedEntries} Flagged
                                </Badge>
                              ) : progress === 100 ? (
                                <Badge className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">
                                  Fully Reconciled
                                </Badge>
                              ) : (
                                <Badge className="bg-muted hover:bg-muted">
                                  {reconciledEntries}/{totalEntries} Reconciled
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reconcile Dialog */}
      <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reconcile Journal Entry</DialogTitle>
            <DialogDescription>Mark this journal entry as reconciled after verifying its accuracy.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Journal Entry Details</h3>
                <div className="border rounded-md p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{selectedEntry?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span>{selectedEntry?.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span>{selectedEntry?.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>
                      {selectedEntry?.debit > 0
                        ? formatCurrency(selectedEntry?.debit)
                        : formatCurrency(selectedEntry?.credit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reconcile-note">Reconciliation Notes</Label>
                <Input
                  id="reconcile-note"
                  value={reconcileNote}
                  onChange={(e) => setReconcileNote(e.target.value)}
                  placeholder="Add any notes about this reconciliation"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="confirm-reconcile" />
                <Label htmlFor="confirm-reconcile">
                  I confirm that I have verified this entry against external documentation
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReconcileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReconcile} disabled={isReconciling}>
              {isReconciling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Reconciling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Reconciled
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Flag Journal Entry</DialogTitle>
            <DialogDescription>Flag this journal entry for review or correction.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Journal Entry Details</h3>
                <div className="border rounded-md p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{selectedEntry?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span>{selectedEntry?.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span>{selectedEntry?.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>
                      {selectedEntry?.debit > 0
                        ? formatCurrency(selectedEntry?.debit)
                        : formatCurrency(selectedEntry?.credit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag-reason">Reason for Flagging</Label>
                <Select defaultValue="discrepancy">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discrepancy">Amount Discrepancy</SelectItem>
                    <SelectItem value="documentation">Missing Documentation</SelectItem>
                    <SelectItem value="classification">Incorrect Classification</SelectItem>
                    <SelectItem value="duplicate">Potential Duplicate</SelectItem>
                    <SelectItem value="other">Other Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag-note">Notes</Label>
                <Input
                  id="flag-note"
                  value={flagNote}
                  onChange={(e) => setFlagNote(e.target.value)}
                  placeholder="Describe the issue with this entry"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFlag} disabled={isFlagging || !flagNote}>
              {isFlagging ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Flagging...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Flag for Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

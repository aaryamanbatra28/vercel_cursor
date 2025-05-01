import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Filter, Search } from "lucide-react"

export default function ApprovedJournalsPage() {
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
          <div className="flex items-center gap-2 border rounded-md px-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="april">
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Journal Entries</CardTitle>
          <CardDescription>Journal entries that have been reviewed and approved</CardDescription>
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
              <div className="col-span-1 text-right">Approved By</div>
            </div>

            {/* Sample approved entries */}
            <div className="grid grid-cols-8 border-b px-4 py-3 text-sm">
              <div className="col-span-2">Office Rent Payment</div>
              <div className="col-span-1">Apr 10, 2025</div>
              <div className="col-span-1">CHK-1001</div>
              <div className="col-span-1">Rent Expense</div>
              <div className="col-span-1 text-right">$12,500.00</div>
              <div className="col-span-1 text-right">-</div>
              <div className="col-span-1 text-right">J. Smith</div>
            </div>

            <div className="grid grid-cols-8 border-b px-4 py-3 text-sm">
              <div className="col-span-2">Office Rent Payment</div>
              <div className="col-span-1">Apr 10, 2025</div>
              <div className="col-span-1">CHK-1001</div>
              <div className="col-span-1">Cash</div>
              <div className="col-span-1 text-right">-</div>
              <div className="col-span-1 text-right">$12,500.00</div>
              <div className="col-span-1 text-right">J. Smith</div>
            </div>

            <div className="grid grid-cols-8 border-b px-4 py-3 text-sm">
              <div className="col-span-2">Payroll Processing</div>
              <div className="col-span-1">Apr 05, 2025</div>
              <div className="col-span-1">PR-4502</div>
              <div className="col-span-1">Salary Expense</div>
              <div className="col-span-1 text-right">$135,000.00</div>
              <div className="col-span-1 text-right">-</div>
              <div className="col-span-1 text-right">M. Johnson</div>
            </div>

            <div className="grid grid-cols-8 border-b px-4 py-3 text-sm">
              <div className="col-span-2">Payroll Processing</div>
              <div className="col-span-1">Apr 05, 2025</div>
              <div className="col-span-1">PR-4502</div>
              <div className="col-span-1">Cash</div>
              <div className="col-span-1 text-right">-</div>
              <div className="col-span-1 text-right">$135,000.00</div>
              <div className="col-span-1 text-right">M. Johnson</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Upload, ArrowUpRight, BarChart3, FileText, DollarSign } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234.59</div>
                <p className="text-xs text-muted-foreground">+4.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$32,997.30</div>
                <p className="text-xs text-muted-foreground">+10.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+3 since yesterday</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Chart Placeholder
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>You have 12 pending journal entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">New invoice recorded</p>
                      <p className="text-sm text-muted-foreground">Invoice #1234 for $1,234.56</p>
                    </div>
                    <div className="text-sm text-muted-foreground">2h ago</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Expense needs approval</p>
                      <p className="text-sm text-muted-foreground">Travel expense for $567.89</p>
                    </div>
                    <div className="text-sm text-muted-foreground">5h ago</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">New payment received</p>
                      <p className="text-sm text-muted-foreground">Payment from Client A for $5,432.10</p>
                    </div>
                    <div className="text-sm text-muted-foreground">1d ago</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Link href="/journals" className="flex items-center">
                    View All
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  <Link href="/documents">Upload Documents</Link>
                </Button>
                <Button className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  <Link href="/journals">Create Journal Entry</Link>
                </Button>
                <Button className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <Link href="/reports">Generate Report</Link>
                </Button>
                <Button className="w-full justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <Link href="/analysis">Run Analysis</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Monthly Financial Close</p>
                      <p className="text-sm text-muted-foreground">April 30, 2025</p>
                    </div>
                    <div className="text-sm font-medium text-red-500">5 days left</div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Quarterly Tax Filing</p>
                      <p className="text-sm text-muted-foreground">May 15, 2025</p>
                    </div>
                    <div className="text-sm font-medium text-yellow-500">20 days left</div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Annual Budget Review</p>
                      <p className="text-sm text-muted-foreground">June 1, 2025</p>
                    </div>
                    <div className="text-sm font-medium text-green-500">37 days left</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[400px] flex items-center justify-center text-muted-foreground">
          Analytics content coming soon
        </TabsContent>

        <TabsContent value="reports" className="h-[400px] flex items-center justify-center text-muted-foreground">
          Reports content coming soon
        </TabsContent>

        <TabsContent value="notifications" className="h-[400px] flex items-center justify-center text-muted-foreground">
          Notifications content coming soon
        </TabsContent>
      </Tabs>
    </div>
  )
}

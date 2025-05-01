"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  LineChart,
  Sparkles,
} from "lucide-react"

export default function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("april")

  return (
    <main className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Financial Insights</h1>
            <p className="text-muted-foreground">
              AI-generated insights and recommendations based on your financial data
            </p>
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
                  <SelectItem value="q1">Q1 2025</SelectItem>
                  <SelectItem value="ytd">YTD 2025</SelectItem>
                  <SelectItem value="fy2024">FY 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-2 mb-4">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search insights..." className="w-full md:w-[300px] pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Insights</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 space-y-6">
            {/* Revenue Insights */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Revenue Insights
                </CardTitle>
                <CardDescription>Analysis of revenue trends and opportunities</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Enterprise Revenue Growth</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enterprise subscription revenue has grown 15% MoM. This growth is primarily driven by three new
                      enterprise customers onboarded in late March, plus higher-than-expected expansion revenue from
                      existing customers. The sales team's new account-based marketing approach appears to be yielding
                      results ahead of schedule.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-amber-500/20 p-2">
                    <BarChart3 className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">SMB Revenue Plateau</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      SMB subscription revenue has plateaued over the last 3 months, growing only 1.4% in April. This is
                      below the target growth rate of 5%. Analysis of churn data shows that price sensitivity is
                      increasing in this segment, with 60% of churned customers citing cost as the primary reason for
                      cancellation. Consider introducing a lower-tier plan or volume discounts.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <LineChart className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Professional Services Opportunity</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Professional services revenue has a 92% customer satisfaction rate, but only accounts for 15% of
                      total revenue. There's an opportunity to expand this high-margin segment by offering
                      implementation packages to new enterprise customers. Based on current conversion rates, this could
                      increase services revenue by 25-30% in the next quarter.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Expense Insights */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-primary" />
                  Expense Insights
                </CardTitle>
                <CardDescription>Analysis of expense patterns and optimization opportunities</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-rose-500/20 p-2">
                    <TrendingUp className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Advertising Expense Variance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Advertising expenses are $12,000 (60%) over budget. This is primarily due to increased Google Ads
                      spending for the new product launch. While this exceeds the monthly allocation, it aligns with the
                      quarterly marketing plan that anticipated front-loading ad spend. The CAC remains within
                      acceptable parameters at $450 per new customer, below the $500 target.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Cloud Infrastructure Savings</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cloud infrastructure costs are $8,500 (15%) under budget despite increased user traffic. The
                      recent migration to serverless architecture and implementation of auto-scaling policies has
                      yielded greater efficiency than initially projected. Consider reallocating some of these savings
                      to accelerate the database optimization project.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-amber-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Office Supplies Anomaly</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Office supplies expenses have increased by 35% compared to the previous quarter. This appears to
                      be driven by multiple small purchases rather than a few large ones. Consider implementing a
                      centralized purchasing system for office supplies to improve cost control and take advantage of
                      bulk discounts.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Opportunities */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Strategic Opportunities
                </CardTitle>
                <CardDescription>Strategic recommendations based on financial analysis</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Pricing Strategy Optimization</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analysis of customer acquisition costs, lifetime value, and competitive pricing suggests an
                      opportunity to increase enterprise tier pricing by 10-15% without significant impact on conversion
                      rates. This could increase annual recurring revenue by approximately $180,000 based on current
                      customer acquisition projections.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4 bg-white">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Cash Flow Optimization</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your company currently has $1.2M in cash reserves, which is 40% above the recommended operating
                      threshold. Consider allocating $300K to short-term investments to generate additional income while
                      maintaining sufficient liquidity for operations. Based on current market rates, this could
                      generate approximately $12,000 in additional annual income.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
                <CardDescription>Detailed analysis of revenue streams and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a specific revenue category to view detailed insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Expense Insights</CardTitle>
                <CardDescription>
                  Detailed analysis of expense categories and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a specific expense category to view detailed insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Insights</CardTitle>
                <CardDescription>Analysis of cash flow patterns and optimization opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a specific cash flow category to view detailed insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>AI-identified opportunities for business growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a specific opportunity category to view detailed insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Financial Risks</CardTitle>
                <CardDescription>AI-identified financial risks and mitigation strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a specific risk category to view detailed insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

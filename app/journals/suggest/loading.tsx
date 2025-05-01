import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <main className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-4 w-[400px] mt-2" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[250px]" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Skeleton className="h-5 w-[180px]" />
                        <Skeleton className="h-4 w-[100px] mt-1" />
                      </div>
                      <Skeleton className="h-6 w-[80px]" />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Skeleton className="h-6 w-[100px]" />
                      <Skeleton className="h-8 w-[120px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[150px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[300px]" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

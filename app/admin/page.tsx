import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderTree, FileText, ImageIcon, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export const revalidate = 0

export default async function AdminDashboard() {
  // Fetch counts
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  const { count: serviceCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  const { count: activeServiceCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: carouselCount } = await supabase
    .from('carousel')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const stats = [
    {
      title: "Total Categories",
      value: categoryCount || 0,
      description: "Active service categories",
      icon: FolderTree,
      color: "text-blue-600",
    },
    {
      title: "Total Services",
      value: serviceCount || 0,
      description: "Services available",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Carousel Slides",
      value: carouselCount || 0,
      description: "Active carousel items",
      icon: ImageIcon,
      color: "text-purple-600",
    },
    {
      title: "Active Services",
      value: activeServiceCount || 0,
      description: "Total active services",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the MPOnline Admin Panel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your MPOnline service center</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/categories"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <FolderTree className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Manage Categories</span>
          </a>
          <a
            href="/admin/services"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Manage Services</span>
          </a>
          <a
            href="/admin/carousel"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <ImageIcon className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Manage Carousel</span>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}



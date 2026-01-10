"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Loader2, LifeBuoy, FileText, LayoutDashboard, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"

type Service = {
    id: string
    title: string
    short_description: string | null
    price: number
    apply_url: string
}

export default function UserDashboard() {
    const { user } = useAuth()
    const [activeServices, setActiveServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchActiveServices()
    }, [])

    const fetchActiveServices = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("services")
                .select("id, title, short_description, price, apply_url")
                .eq("is_active", true)
                .order("title")

            if (error) throw error
            setActiveServices(data || [])
        } catch (error) {
            console.error("Error fetching services:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredServices = activeServices.filter((service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const quickActions = [
        { title: "Application Status", href: "/dashboard/status", icon: FileText, desc: "Track your apps" },
        { title: "Help & Support", href: "/dashboard/support", icon: LifeBuoy, desc: "Get assistance" },
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}!
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action) => (
                    <Link key={action.title} href={action.href}>
                        <Card className="hover:bg-accent/50 transition-colors h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                                <action.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">{action.desc}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Services Section */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-semibold">Available Services</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search services..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredServices.map((service) => (
                            <Card key={service.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-lg">{service.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {service.short_description || "Apply for this service online."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-2xl font-bold text-primary">₹{service.price}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Processing fees</p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full group" asChild>
                                        <Link href={service.apply_url || "#"} target="_blank" rel="noopener noreferrer">
                                            Apply Now
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No services available</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                            {searchQuery
                                ? "No services match your search query."
                                : "There are currently no active services available for application."}
                        </p>
                        {searchQuery && (
                            <Button variant="outline" onClick={() => setSearchQuery("")}>
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}
            </section>

            {/* Profile Section */}
            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">
                            {(user?.email?.[0] || "U").toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold">{user?.user_metadata?.full_name || "User Profile"}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" className="ml-auto" asChild>
                        <Link href="/dashboard/profile">Manage Profile</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

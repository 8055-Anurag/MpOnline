"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"

type UserService = {
    id: string
    title: string
    description: string | null
    price: number
    google_form_url: string
}

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth()
    const [services, setServices] = useState<UserService[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from('user_services')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (data) setServices(data)
            setLoading(false)
        }
        fetchServices()
    }, [])

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <Button asChild><Link href="/user/login">Go to Login</Link></Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
                <Button variant="outline" asChild>
                    <Link href="/user/login">Logout</Link>
                </Button>
            </div>

            <section>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-semibold">Exclusive Services</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        User Only
                    </span>
                </div>

                {services.length === 0 ? (
                    <div className="text-center p-12 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">No services are available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {services.map(service => (
                            <Card key={service.id} className="flex flex-col hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>{service.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {service.description || "No description available."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {service.price === 0 ? "Free" : `₹${service.price}`}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/user/services/${service.id}`}>
                                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

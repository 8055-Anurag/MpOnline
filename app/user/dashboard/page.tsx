"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, ArrowRight, FileText, Download, ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ApplicationDocuments } from "@/components/application-documents"

type UserService = {
    id: string
    title: string
    description: string | null
    price: number
    google_form_url: string
}

type UserApplication = {
    id: string
    application_no: string
    service_name: string
    status: "submitted" | "under_review" | "approved" | "rejected" | "completed"
    created_at: string
    price: number | null
}

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth()
    const [services, setServices] = useState<UserService[]>([])
    const [applications, setApplications] = useState<UserApplication[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return

            setLoading(true)
            try {
                // Fetch user-specific services
                const { data: servicesData } = await supabase
                    .from('user_services')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                if (servicesData) setServices(servicesData)

                // Fetch user's applications
                const { data: appsData } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (appsData) setApplications(appsData as UserApplication[])

            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Completed</Badge>
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>
            case 'under_review':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Under Review</Badge>
            case 'submitted':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Submitted</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user.email}</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/user/login">Logout</Link>
                </Button>
            </div>

            {/* My Applications Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Applications</h2>
                </div>

                {applications.length === 0 ? (
                    <div className="text-center p-12 border rounded-xl bg-muted/10 border-dashed">
                        <p className="text-muted-foreground">You haven't applied for any services yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((app: UserApplication) => (
                            <Card key={app.id} className="overflow-hidden border-l-4 border-l-primary">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{app.service_name}</h3>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span>App No: <span className="font-mono text-gray-700">{app.application_no}</span></span>
                                                <span>•</span>
                                                <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Documents
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Application Documents</DialogTitle>
                                                        <DialogDescription>
                                                            View and download documents for application {app.application_no}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4">
                                                        <ApplicationDocuments applicationId={app.id} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {(app.status === 'completed' || app.status === 'approved') && (
                                                <Button className="bg-green-600 hover:bg-green-700">
                                                    Download Receipt
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <Separator />

            {/* Exclusive Services Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Available Exclusive Services</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        User Only
                    </span>
                </div>

                {services.length === 0 ? (
                    <div className="text-center p-12 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">No exclusive services are available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service: UserService) => (
                            <Card key={service.id} className="flex flex-col hover:shadow-lg transition-all hover:-translate-y-1">
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
                                    <Button asChild className="w-full h-11">
                                        <Link href={`/user/services/${service.id}`}>
                                            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
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

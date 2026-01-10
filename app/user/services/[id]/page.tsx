"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, ExternalLink, CheckCircle } from "lucide-react"
import Link from "next/link"

type UserService = {
    id: string
    title: string
    description: string | null
    price: number
    google_form_url: string
    required_documents: string | null
}

export default function ServiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [service, setService] = useState<UserService | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchService = async () => {
            const serviceId = Array.isArray(params.id) ? params.id[0] : params.id
            if (!serviceId) return

            const { data, error } = await supabase
                .from('user_services')
                .select('*')
                .eq('id', serviceId)
                .single()

            if (data) setService(data)
            else console.error(error)

            setLoading(false)
        }
        fetchService()
    }, [params.id])

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!service) {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center">
                <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
                <Button asChild variant="outline">
                    <Link href="/user/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        )
    }

    const getProcessedUrl = () => {
        if (!service || !user) return service?.google_form_url || "#"

        let url = service.google_form_url

        // Replace placeholders (support both {{KEY}} and KEY styles)
        url = url.replace(/{{USER_ID}}/g, user.id).replace(/USER_ID/g, user.id)
        url = url.replace(/{{SERVICE_ID}}/g, service.id).replace(/SERVICE_ID/g, service.id)
        url = url.replace(/{{SERVICE_NAME}}/g, encodeURIComponent(service.title)).replace(/SERVICE_NAME/g, encodeURIComponent(service.title))

        return url
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/user/dashboard" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{service.title}</h1>
                        <p className="text-2xl font-bold text-blue-600">
                            {service.price === 0 ? "Free" : `₹${service.price}`}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none whitespace-pre-wrap">
                                {service.description || "No description available."}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Required Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {service.required_documents ? (
                                <ul className="space-y-2">
                                    {service.required_documents.split(',').map((doc, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                            <span>{doc.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No specific documents listed.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <Card className="sticky top-6 border-blue-100 shadow-md">
                        <CardHeader className="bg-blue-50/50">
                            <CardTitle>Apply Now</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <p className="text-sm text-muted-foreground">
                                You will be redirected to a secure Google Form to complete your application.
                            </p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                <a href={getProcessedUrl()} target="_blank" rel="noopener noreferrer">
                                    Proceed to Application <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

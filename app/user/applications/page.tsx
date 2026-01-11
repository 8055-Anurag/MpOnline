"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, FileText, ArrowLeft, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ApplicationDocuments } from "@/components/application-documents"

type UserApplication = {
    id: string
    application_no: string
    service_name: string
    status: "submitted" | "under_review" | "approved" | "rejected" | "completed"
    created_at: string
}

export default function UserApplicationsPage() {
    const { user, loading: authLoading } = useAuth()
    const [applications, setApplications] = useState<UserApplication[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return

            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                if (data) setApplications(data as UserApplication[])
            } catch (error) {
                console.error("Error fetching applications:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchApplications()
    }, [user])

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

    const filteredApplications = applications.filter(app =>
        app.application_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.service_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDownloadResult = async (applicationId: string) => {
        try {
            const { data, error } = await supabase
                .from('application_documents')
                .select('document_url')
                .eq('application_id', applicationId)
                .eq('document_type', 'result_doc')
                .single()

            if (error) throw error
            if (data?.document_url) {
                window.open(data.document_url, '_blank')
            }
        } catch (error) {
            console.error('Error downloading result:', error)
        }
    }

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
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/user/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                    <p className="text-muted-foreground">Track and manage your submitted service requests.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by application number or service name..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {applications.length === 0 ? (
                <Card className="text-center p-12 border-dashed">
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">You haven't applied for any services yet.</p>
                        <Button asChild>
                            <Link href="/user/dashboard">Browse Available Services</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredApplications.length === 0 ? (
                <Card className="text-center p-12 border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground">No applications found matching your search.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredApplications.map((app) => (
                        <Card key={app.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg">{app.service_name}</h3>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span>App No: <span className="font-mono">{app.application_no}</span></span>
                                            <span className="mx-2">•</span>
                                            <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Documents
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Application Documents</DialogTitle>
                                                    <DialogDescription>
                                                        Files for application {app.application_no}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="mt-4">
                                                    <ApplicationDocuments applicationId={app.id} excludeResultDoc={true} />
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {(app.status === 'completed' || app.status === 'approved') && (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleDownloadResult(app.id)}
                                            >
                                                Download Result
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

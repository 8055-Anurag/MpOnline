"use client"

import { useState } from "react"
import { Search, FileText, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

// Define a type for the application since it's not in the database types yet
type Application = {
    id: string
    application_no: string
    applicant_name: string
    service_name: string
    status: "submitted" | "under_review" | "approved" | "rejected"
    created_at: string
    document_url?: string
}

export default function ApplicationStatusPage() {
    const [applicationId, setApplicationId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<Application | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!applicationId.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)
        setSearched(true)

        try {
            // In a real scenario, we would use the typed client, but since the table is missing
            // from types, we'll cast or trust generic query
            const { data, error: dbError } = await supabase
                .from('applications')
                .select('*')
                .eq('application_no', applicationId.trim())
                .single()

            if (dbError) {
                if (dbError.code === 'PGRST116') {
                    // code for no rows found
                    setError("No application found with this ID. Please check and try again.")
                } else {
                    throw dbError
                }
            } else {
                setResult(data as Application)
            }
        } catch (err) {
            console.error("Error fetching application:", err)
            setError("An error occurred while checking status. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200'
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
            case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'under_review': return 'text-amber-600 bg-amber-50 border-amber-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-5 w-5" />
            case 'rejected': return <XCircle className="h-5 w-5" />
            case 'submitted': return <FileText className="h-5 w-5" />
            case 'under_review': return <Clock className="h-5 w-5" />
            default: return <Clock className="h-5 w-5" />
        }
    }

    const formatStatus = (str: string) => {
        return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20">
            <Card className="w-full max-w-lg shadow-lg border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold text-primary">Check Application Status</CardTitle>
                    <CardDescription>
                        Enter your Application ID to view current status and details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="app-id">Application Number</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="app-id"
                                    placeholder="e.g. MP-2025-AB23CD"
                                    className="pl-10 uppercase"
                                    value={applicationId}
                                    onChange={(e) => setApplicationId(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !applicationId}>
                            {loading ? "Checking..." : "Check Status"}
                        </Button>
                    </form>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold w-fit ${getStatusColor(result.status)}`}>
                                            {getStatusIcon(result.status)}
                                            {formatStatus(result.status)}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            {new Date(result.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Application No</p>
                                            <p className="font-medium">{result.application_no}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Service</p>
                                            <p className="font-medium">{result.service_name || "General Service"}</p>
                                        </div>
                                    </div>
                                    {result.applicant_name && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Applicant Name</p>
                                            <p className="font-medium">{result.applicant_name}</p>
                                        </div>
                                    )}
                                </div>

                                {result.document_url && result.status === 'approved' && (
                                    <Button className="w-full gap-2 mt-2" variant="outline" asChild>
                                        <a href={result.document_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                            Download Document
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

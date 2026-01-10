"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
    ArrowLeft,
    Loader2,
    FileText,
    User,
    Calendar,
    CreditCard,
    Download,
    Upload,
    Save,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react"

// Mock Data Types
type ApplicationStatus = "submitted" | "under_review" | "approved" | "rejected" | "completed"

type Application = {
    id: string
    application_no: string
    applicant_name: string
    mobile: string
    service_name: string
    description: string
    created_at: string
    status: ApplicationStatus
    price: number
    document_url?: string | null
    result_doc_url?: string | null
}

// Mock Data Store (simulating DB)
const mockDB: Record<string, Application> = {
    "1": {
        id: "1",
        application_no: "APP-2023-001",
        applicant_name: "Rajesh Kumar",
        mobile: "+91 98765 43210",
        service_name: "Caste Certificate",
        description: "Issuance of caste certificate for SC/ST/OBC categories.",
        created_at: new Date().toISOString(),
        status: "submitted",
        price: 450,
    },
    "101": {
        id: "101",
        application_no: "APP-2023-010",
        applicant_name: "Anita Desai",
        mobile: "+91 91234 56780",
        service_name: "Driving License Renewal",
        description: "Renewal of permanent driving license.",
        created_at: new Date(Date.now() - 432000000).toISOString(),
        status: "under_review",
        price: 600,
        document_url: "mock-doc.pdf"
    }
}

export default function ApplicationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [app, setApp] = useState<Application | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Edit State
    const [status, setStatus] = useState<ApplicationStatus>("submitted")
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            const id = params.id as string
            // Mock lookup
            const foundApp = mockDB[id] || {
                // Fallback mock if ID doesn't match specific keys
                id: id,
                application_no: `APP-2023-${id.padStart(3, '0')}`,
                applicant_name: "Mock Applicant",
                mobile: "+91 XXXXX XXXXX",
                service_name: "Mock Service Name",
                description: "This is a placeholder for service description.",
                created_at: new Date().toISOString(),
                status: "submitted",
                price: 500
            }

            setApp(foundApp)
            setStatus(foundApp.status)
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [params.id])

    const handleSave = async () => {
        setSaving(true)
        // Simulate Save API
        await new Promise(resolve => setTimeout(resolve, 1500))

        setSaving(false)
        toast({
            title: "Changes Saved",
            description: "Application status and documents updated successfully.",
        })

        // Update local state to reflect "saved"
        if (app) {
            setApp({ ...app, status: status })
        }
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case "completed":
            case "approved":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>
            case "rejected":
                return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>
            case "under_review":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1"><Clock className="w-3 h-3" /> Under Review</Badge>
            default:
                return <Badge variant="secondary" className="gap-1"><FileText className="w-3 h-3" /> {s}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!app) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-xl font-semibold">Application Not Found</h2>
                <Button asChild variant="outline">
                    <Link href="/operator/applications/my">Back to My Applications</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                        <Link href="/operator/applications/my">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Application Details</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{app.application_no}</span>
                            <span>•</span>
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div>
                    {getStatusBadge(app.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-500" />
                                Applicant Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                                <div className="font-medium text-base">{app.applicant_name}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Mobile Number</Label>
                                <div className="font-medium text-base">{app.mobile}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Application Date</Label>
                                <div className="font-medium text-base">{new Date(app.created_at).toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Application ID</Label>
                                <div className="font-mono text-sm bg-gray-50 px-2 py-1 rounded inline-block">{app.application_no}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                Service Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Service Requested</Label>
                                <div className="font-medium text-lg text-blue-700">{app.service_name}</div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                                <p className="text-gray-600 text-sm leading-relaxed">{app.description}</p>
                            </div>

                            <Separator className="my-2" />

                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium text-gray-700">Total Fee Paid</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">₹{app.price}</span>
                            </div>

                            {app.document_url && (
                                <div className="mt-4">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Submitted Documents</Label>
                                    <div className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-orange-500" />
                                            <div>
                                                <p className="text-sm font-medium">Application_Document.pdf</p>
                                                <p className="text-xs text-gray-500">2.4 MB</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" /> Download
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions Column */}
                <div className="space-y-6">
                    <Card className="border-blue-100 shadow-md">
                        <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
                            <CardTitle className="text-blue-900 text-lg">Process Application</CardTitle>
                            <CardDescription>Update status and result</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="status">Current Status</Label>
                                <Select value={status} onValueChange={(val) => setStatus(val as ApplicationStatus)}>
                                    <SelectTrigger id="status" className="bg-white">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="result-file">Upload Result Document</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        id="result-file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-900">
                                        {file ? file.name : "Click to upload result"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, JPG up to 5MB"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50/50 border-t border-gray-100 pt-4">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Help & Support</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="text-gray-600">Need to clarify something with the applicant?</p>
                            <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md font-medium">
                                <span className="i-lucide-phone"></span>
                                {app.mobile}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

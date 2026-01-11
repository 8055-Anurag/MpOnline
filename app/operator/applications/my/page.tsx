"use client"

import React, { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Loader2, Pencil, Upload, FileText, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { ApplicationStatus } from "@/types/database"
import { ApplicationDocuments } from "@/components/application-documents"

type Application = {
    id: string
    application_no: string
    applicant_name: string
    service_name: string
    created_at: string
    accepted_at: string | null
    status: ApplicationStatus
    price: number | null
    operator_price: number | null // Added
    document_url?: string | null
}

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedApp, setSelectedApp] = useState<Application | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [status, setStatus] = useState<ApplicationStatus>("under_review")
    const [file, setFile] = useState<File | null>(null)

    const { toast } = useToast()
    const { user } = useAuth()

    const fetchApplications = async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .eq('operator_id', user.id)
                .order('accepted_at', { ascending: false })

            if (error) throw error

            setApplications(data || [])
        } catch (error) {
            console.error("Error fetching my apps:", error)
            toast({
                title: "Error",
                description: "Failed to load your applications.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [user])

    const handleEditClick = (app: Application) => {
        setSelectedApp(app)
        setStatus(app.status)
        setFile(null)
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!selectedApp) return
        setIsSaving(true)

        try {
            let publicUrl = selectedApp.document_url

            // 1. Upload File if selected
            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${selectedApp.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('application-document')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('application-document')
                    .getPublicUrl(filePath)

                publicUrl = urlData.publicUrl
            }

            if (!publicUrl) {
                throw new Error("No document URL generated")
            }

            // 2. Insert into document table
            const { error: docError } = await supabase.from('application_documents').insert({
                application_id: selectedApp.id,
                document_url: publicUrl,
                document_type: 'result_doc'
            })
            if (docError) throw docError

            // 3. Update Application Record status
            const { error: updateError } = await supabase.from('applications')
                .update({
                    status: status,
                })
                .eq('id', selectedApp.id)

            if (updateError) throw updateError

            // 3. Update Local State
            setApplications((prev: Application[]) => prev.map((app: Application) =>
                app.id === selectedApp.id
                    ? { ...app, status: status, document_url: publicUrl }
                    : app
            ))

            setIsDialogOpen(false)
            toast({
                title: "Application Updated",
                description: `Application updated successfully.`,
            })

        } catch (error) {
            console.error("Error updating application:", error)
            toast({
                title: "Update Failed",
                description: "There was an error updating the task.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
            case "approved":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Completed</Badge>
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>
            case "under_review":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Under Review</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Applications</h2>
                    <p className="text-muted-foreground mt-2">
                        Manage your assigned workload. Update status and upload results.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[150px]">Application No</TableHead>
                            <TableHead>Applicant Name</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Accepted Date</TableHead>
                            <TableHead>Operator Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <FileText className="h-8 w-8 text-gray-300" />
                                        <p>No applications assigned to you yet.</p>
                                        <Button variant="link" asChild className="text-blue-600">
                                            <a href="/operator/applications/available">Browse Available Applications</a>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.application_no}</TableCell>
                                    <TableCell>{app.applicant_name}</TableCell>
                                    <TableCell>{app.service_name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {app.accepted_at ? new Date(app.accepted_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="font-medium">₹{app.operator_price || 0}</TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(app)}
                                            className="border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <Pencil className="h-3 w-3 mr-2" />
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Manage Application</DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Update status and upload result documents for <b>{selectedApp?.application_no}</b>.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Applicant</Label>
                                    <div className="font-semibold text-gray-900">{selectedApp.applicant_name}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Operator Price</Label>
                                    <div className="font-semibold text-green-700">₹{selectedApp.operator_price || 0}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="status" className="font-semibold">Application Status</Label>
                                <Select value={status} onValueChange={(val) => setStatus(val as ApplicationStatus)}>
                                    <SelectTrigger id="status" className="h-10">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="under_review">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                Under Review
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                Completed / Approved
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-500" />
                                                Rejected
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-semibold">
                                    {status === 'completed' ? 'Upload Final Document *' : 'Upload Document (Optional)'}
                                </Label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-6 transition-colors text-center ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-400'}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const droppedFile = e.dataTransfer.files?.[0]
                                        if (droppedFile) setFile(droppedFile)
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`p-3 rounded-full ${file ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <Upload className={`h-6 w-6 ${file ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center gap-1 text-sm">
                                                <label htmlFor="op-file-upload" className="font-semibold text-blue-600 cursor-pointer hover:underline">
                                                    Upload a file
                                                </label>
                                                <span className="text-muted-foreground">or drag and drop</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                                        </div>
                                        {file && (
                                            <div className="mt-2 text-sm font-medium text-green-700 flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                {file.name}
                                            </div>
                                        )}
                                        <input
                                            id="op-file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                {status === 'completed' && !file && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        A final document is required to complete the application.
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Current Documents
                                </Label>
                                <div className="max-h-[150px] overflow-y-auto pr-2 border rounded-md p-2 bg-gray-50/30">
                                    <ApplicationDocuments applicationId={selectedApp.id} />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || (status === 'completed' && !file)}
                            className={`${status === 'completed' ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-600 hover:bg-blue-700'} text-white min-w-[140px]`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                status === 'completed' ? "Upload & Complete" : "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

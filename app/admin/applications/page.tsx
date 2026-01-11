"use client"

import React, { useState, useEffect } from "react"
import { Search, Loader2, Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, DollarSign, ExternalLink, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ApplicationStatus } from "@/types/database"
import { ApplicationDocuments } from "@/components/application-documents"

// Updated Types
type Application = {
    id: string
    application_no: string
    applicant_name: string
    mobile: string
    service_name: string
    status: ApplicationStatus
    created_at: string
    document_url?: string
    operator_id: string | null
    price: number | null
    accepted_at: string | null
}

const statusOptions = [
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
]

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [uploadingId, setUploadingId] = useState<string | null>(null)
    const [priceEditId, setPriceEditId] = useState<string | null>(null)
    const [newPrice, setNewPrice] = useState<string>("")

    // For Relist Dialog
    const [relistId, setRelistId] = useState<string | null>(null)

    const { toast } = useToast()

    const fetchApplications = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false })

            if (searchQuery) {
                query = query.ilike('application_no', `%${searchQuery}%`)
            }

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter as ApplicationStatus)
            }

            const { data, error } = await query

            if (error) throw error

            setApplications((data as Application[]) || [])
        } catch (error: any) {
            console.error('Error fetching applications:', error)
            // Mock data fallback for UI demo if DB fields missing
            setApplications([
                {
                    id: "1",
                    application_no: "APP-001",
                    applicant_name: "John Doe",
                    mobile: "9876543210",
                    service_name: "Caste Certificate",
                    status: "under_review",
                    created_at: new Date().toISOString(),
                    operator_id: "op-123",
                    price: 150,
                    accepted_at: new Date().toISOString()
                },
                {
                    id: "2",
                    application_no: "APP-002",
                    applicant_name: "Jane Smith",
                    mobile: "9123456789",
                    service_name: "Income Certificate",
                    status: "submitted",
                    created_at: new Date().toISOString(),
                    operator_id: null,
                    price: 100,
                    accepted_at: null
                }
            ])
            toast({
                title: "Loaded (Mock Data)",
                description: "Using mock data due to sync issues or missing DB fields.",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Debounce search could go here
        fetchApplications()
    }, [statusFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchApplications()
    }

    // Status Update
    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic Update
            setApplications((apps: Application[]) => apps.map((app: Application) =>
                app.id === id ? { ...app, status: newStatus as ApplicationStatus } : app
            ))

            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus as ApplicationStatus })
                .eq('id', id)

            if (error) throw error

            toast({ title: "Status Updated", description: "Application status updated." })
        } catch (error) {
            fetchApplications() // Revert on error
            toast({ title: "Update Failed", variant: "destructive" })
        }
    }

    // File Upload
    const handleFileUpload = async (id: string, file: File) => {
        setUploadingId(id)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage.from('application-document').upload(filePath, file)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('application-document').getPublicUrl(filePath)

            const { error: docError } = await supabase.from('application_documents').insert({
                application_id: id,
                document_url: publicUrl,
                document_type: 'result_doc'
            })
            if (docError) throw docError

            setApplications((apps: Application[]) => apps.map((app: Application) => app.id === id ? { ...app, status: "approved" as ApplicationStatus } : app))
            setRefreshTrigger((prev: number) => prev + 1)
            toast({ title: "Document Uploaded & Saved to New Table" })
        } catch (error) {
            toast({ title: "Upload Failed", variant: "destructive" })
        } finally {
            setUploadingId(null)
        }
    }

    // Relist Application
    const handleRelist = async () => {
        if (!relistId) return
        try {
            // Optimistic
            setApplications((apps: Application[]) => apps.map((app: Application) =>
                app.id === relistId ? { ...app, operator_id: null, accepted_at: null, status: "submitted" as ApplicationStatus } : app
            ))

            const { error } = await supabase.from('applications')
                .update({ operator_id: null, accepted_at: null, status: 'submitted' })
                .eq('id', relistId)

            if (error) throw error

            toast({ title: "Application Relisted", description: "Operator assignment removed." })
        } catch (error) {
            fetchApplications()
            toast({ title: "Relist Failed", variant: "destructive" })
        } finally {
            setRelistId(null)
        }
    }

    // Edit Price
    const openPriceEdit = (app: Application) => {
        setPriceEditId(app.id)
        setNewPrice(app.price?.toString() || "")
    }

    const savePrice = async () => {
        if (!priceEditId) return
        const priceVal = parseFloat(newPrice)
        if (isNaN(priceVal)) return

        try {
            setApplications((apps: Application[]) => apps.map((app: Application) =>
                app.id === priceEditId ? { ...app, price: priceVal } : app
            ))

            const { error } = await supabase.from('applications')
                .update({ price: priceVal })
                .eq('id', priceEditId)

            if (error) throw error
            toast({ title: "Price Updated" })
        } catch (error) {
            fetchApplications()
            toast({ title: "Update Failed", variant: "destructive" })
        } finally {
            setPriceEditId(null)
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200'
            case 'completed': return 'text-green-600 bg-green-50 border-green-200'
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
            case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'under_review': return 'text-amber-600 bg-amber-50 border-amber-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
                    <p className="text-muted-foreground">Monitor applications, assignments, and pricing.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                placeholder="Search by App ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileText className="h-8 w-8 mb-2" />
                            <p>No applications found</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>App Number</TableHead>
                                        <TableHead>Service Info</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Operator</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">
                                                {app.application_no}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{app.service_name}</span>
                                                    <span className="text-xs text-muted-foreground">{app.applicant_name} ({app.mobile})</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-2">
                                                                {priceEditId === app.id ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <Input
                                                                            type="number"
                                                                            value={newPrice}
                                                                            onChange={(e) => setNewPrice(e.target.value)}
                                                                            className="w-20 h-8 px-2"
                                                                        />
                                                                        <Button size="icon" className="h-8 w-8 text-green-600" variant="ghost" onClick={savePrice}>
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button size="icon" className="h-8 w-8 text-red-600" variant="ghost" onClick={() => setPriceEditId(null)}>
                                                                            <XCircle className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        variant="ghost"
                                                                        className={`h-8 px-2 text-left font-semibold ${app.operator_id ? 'text-gray-500 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}
                                                                        onClick={() => !app.operator_id && openPriceEdit(app)}
                                                                    >
                                                                        ₹{app.price || 0}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        {app.operator_id && (
                                                            <TooltipContent>
                                                                <p>Price cannot be edited after acceptance</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                {app.operator_id ? (
                                                    <div className="flex flex-col">
                                                        <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                                                            Assigned
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground mt-0.5">ID: {app.operator_id}</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">Unassigned</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select defaultValue={app.status} onValueChange={(val) => handleStatusChange(app.id, val)}>
                                                    <SelectTrigger className={`w-[130px] h-8 border-transparent ${getStatusBadgeColor(app.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 text-right">
                                                    {app.operator_id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                            title="Relist Application"
                                                            onClick={() => setRelistId(app.id)}
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                title="View Documents"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Application Documents</DialogTitle>
                                                                <DialogDescription>
                                                                    Documents for {app.application_no}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="mt-4">
                                                                <ApplicationDocuments applicationId={app.id} refreshTrigger={refreshTrigger} />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id={`file-${app.id}`}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleFileUpload(app.id, file)
                                                            }}
                                                            disabled={uploadingId === app.id}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            disabled={uploadingId === app.id}
                                                            asChild
                                                        >
                                                            <label htmlFor={`file-${app.id}`} className="cursor-pointer">
                                                                {uploadingId === app.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Upload className="h-4 w-4" />
                                                                )}
                                                            </label>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!relistId} onOpenChange={() => setRelistId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Relist Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the current operator assignment and make the application available to everyone again. Status will be reset to 'Submitted'.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRelist} className="bg-amber-600 hover:bg-amber-700">
                            Confirm Relist
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

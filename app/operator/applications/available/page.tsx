"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

type Application = {
    id: string
    application_no: string
    applicant_name: string
    service_name: string
    created_at: string
    status: string
    price: number | null
    operator_price: number | null // Added
    operator_id: string | null
}

export default function AvailableApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth()

    const fetchApplications = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .eq('status', 'submitted')
                .is('operator_id', null)
                .order('created_at', { ascending: true }) // Oldest first

            if (error) throw error

            setApplications(data || [])
        } catch (error) {
            console.error("Error fetching available apps:", error)
            toast({
                title: "Error",
                description: "Failed to load available applications.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    const handleAcceptApplication = async (appId: string) => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to accept tasks.",
                variant: "destructive"
            })
            return
        }

        setProcessingId(appId)

        try {
            // Check if still available (concurrency check)
            const { data: checkData, error: checkError } = await supabase
                .from('applications')
                .select('operator_id')
                .eq('id', appId)
                .single()

            if (checkError) throw checkError
            if (checkData.operator_id) {
                toast({
                    title: "Task Unavailable",
                    description: "This task was just accepted by another operator.",
                    variant: "destructive"
                })
                fetchApplications() // Refresh list
                return
            }

            // Assign to me
            const { error: updateError } = await (supabase.from('applications') as any)
                .update({
                    operator_id: user.id,
                    status: 'under_review',
                    accepted_at: new Date().toISOString()
                })
                .eq('id', appId)

            if (updateError) throw updateError

            // Remove from local list
            setApplications(prev => prev.filter(app => app.id !== appId))

            toast({
                title: "Application Accepted",
                description: "Task assigned to you successfully.",
                variant: "default",
            })

            // Optional: Redirect to my tasks
            // router.push('/operator/applications/my')

        } catch (error) {
            console.error("Error accepting task:", error)
            toast({
                title: "Error",
                description: "Failed to accept task.",
                variant: "destructive"
            })
        } finally {
            setProcessingId(null)
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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Available Applications</h2>
                    <p className="text-muted-foreground mt-2">
                        Select applications from the pool to start processing.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    <span>{applications.length} Pending</span>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[150px]">Application No</TableHead>
                            <TableHead>Applicant Name</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Submission Date</TableHead>
                            <TableHead className="text-right">Operator Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No available applications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium text-gray-900">{app.application_no}</TableCell>
                                    <TableCell>{app.applicant_name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[200px]">{app.service_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(app.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">₹{app.operator_price || 0}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                                            Submitted
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    disabled={processingId === app.id}
                                                >
                                                    {processingId === app.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        "Accept"
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Accept Application?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will assign application <b>{app.application_no}</b> to you.
                                                        You will be responsible for verifying documents and processing this request.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            handleAcceptApplication(app.id)
                                                        }}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Confirm Assignment
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

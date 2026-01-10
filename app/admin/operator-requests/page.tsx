"use client"

import { useEffect, useState } from "react"
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
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

type OperatorRequest = {
    id: string
    full_name: string
    email: string
    mobile: string | null
    is_active: boolean // Changed from status
    created_at: string
}

export default function OperatorRequestsPage() {
    const [requests, setRequests] = useState<OperatorRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchRequests = async () => {
        try {
            // Fetch from 'operators' table where account is inactive (pending approval)
            const { data, error } = await supabase
                .from('operators')
                .select('*')
                .eq('is_active', false)
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Supabase Fetch Error:", error)
                throw error
            }

            console.log("Fetched Requests:", data)
            setRequests(data || [])
        } catch (error) {
            console.error("Error fetching requests (Full):", JSON.stringify(error, null, 2))
            toast({
                title: "Error",
                description: "Failed to load requests.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleApprove = async (request: OperatorRequest) => {
        try {
            // Call API to approve
            const response = await fetch('/api/admin/approve-operator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: request.id })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to approve request')
            }

            setRequests(prev => prev.filter(req => req.id !== request.id))

            toast({
                title: "Request Approved",
                description: "Operator account created successfully.",
                variant: "default"
            })
        } catch (error: any) {
            console.error("Approval error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to approve request.",
                variant: "destructive"
            })
        }
    }

    const handleReject = async (id: string) => {
        try {
            // For rejection, we DELETE the operator record so they can try again or are removed.
            // (Alternatively, we could have a 'status' column, but 'is_active' is boolean)
            const { error } = await supabase
                .from('operators')
                .delete()
                .eq('id', id)

            if (error) throw error

            setRequests(prev => prev.filter(req => req.id !== id))

            toast({
                title: "Request Rejected",
                description: "Operator request has been rejected and removed.",
                variant: "destructive"
            })
        } catch (error) {
            console.error("Reject error:", error)
            toast({
                title: "Error",
                description: "Failed to reject request.",
                variant: "destructive"
            })
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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Operator Requests</h2>
                    <p className="text-muted-foreground mt-2">
                        Review and manage registration requests from new operators.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Full Name</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No pending requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">
                                        {req.full_name}
                                        <div className="text-xs text-muted-foreground mt-0.5">{req.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-gray-700">{req.mobile}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Pending Approval</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
                                                        Approve
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Approve Request?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will grant <b>{req.full_name}</b> access to the operator dashboard.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleApprove(req)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            Confirm Approve
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                                        Reject
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will mark the request for <b>{req.full_name}</b> as rejected.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleReject(req.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Confirm Reject
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
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

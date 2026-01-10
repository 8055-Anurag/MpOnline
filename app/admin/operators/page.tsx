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
import { Loader2, Trash2, Power, PowerOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Operator = {
    id: string
    full_name: string
    mobile: string | null
    is_active: boolean
    created_at: string
}

export default function OperatorsPage() {
    const [operators, setOperators] = useState<(Operator & { stats: { total: number, pending: number, completed: number } })[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchOperators = async () => {
        try {
            // Fetch operators
            const { data: operatorsData, error: operatorsError } = await supabase
                .from('operators')
                .select('*')
                .order('created_at', { ascending: false })

            if (operatorsError) throw operatorsError

            // Fetch all assigned applications to calculate stats
            // We only need operator_id and status for aggregation
            const { data: applicationsData, error: applicationsError } = await supabase
                .from('applications')
                .select('operator_id, status')
                .not('operator_id', 'is', null)

            if (applicationsError) throw applicationsError

            // Calculate stats per operator
            const operatorsWithStats = (operatorsData || []).map(op => {
                const opApps = applicationsData?.filter(app => app.operator_id === op.id) || []

                const total = opApps.length
                const completed = opApps.filter(app => app.status === 'completed').length
                const pending = total - completed // Includes under_review, accepted, etc.

                return {
                    ...op,
                    stats: {
                        total,
                        pending,
                        completed
                    }
                }
            })

            setOperators(operatorsWithStats)
        } catch (error) {
            console.error("Error fetching operators FULL:", JSON.stringify(error, null, 2))
            console.error("Original Error:", error)
            toast({
                title: "Error",
                description: "Failed to load operators and stats.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOperators()
    }, [])

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('operators')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error

            setOperators(prev => prev.map(op =>
                op.id === id ? { ...op, is_active: !currentStatus } : op
            ))

            toast({
                title: !currentStatus ? "Operator Activated" : "Operator Deactivated",
                description: `Operator account is now ${!currentStatus ? 'active' : 'inactive'}.`,
                variant: !currentStatus ? "default" : "destructive"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status.",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('operators')
                .delete()
                .eq('id', id)

            if (error) throw error

            setOperators(prev => prev.filter(op => op.id !== id))

            toast({
                title: "Operator Deleted",
                description: "Operator account has been permanently removed.",
                variant: "destructive"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete operator.",
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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Manage Operators</h2>
                    <p className="text-muted-foreground mt-2">
                        Monitor operator performance and manage account access.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Operator Details</TableHead>
                            <TableHead className="text-center">Workload (Total / Pending / Done)</TableHead>
                            <TableHead>Account Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operators.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No operators found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            operators.map(op => (
                                <TableRow key={op.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{op.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{op.mobile || "No Mobile"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2 text-sm">
                                            <span title="Total Assigned" className="font-semibold">{op.stats.total}</span>
                                            <span className="text-gray-300">/</span>
                                            <span title="Pending" className="text-orange-600 font-medium">{op.stats.pending}</span>
                                            <span className="text-gray-300">/</span>
                                            <span title="Completed" className="text-green-600 font-medium">{op.stats.completed}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {op.is_active ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {op.is_active ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleToggleStatus(op.id, op.is_active)}
                                                >
                                                    <PowerOff className="h-4 w-4 mr-1" /> Deactivate
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleToggleStatus(op.id, op.is_active)}
                                                >
                                                    <Power className="h-4 w-4 mr-1" /> Activate
                                                </Button>
                                            )}

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Operator?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete <b>{op.full_name}</b> and remove all data associations. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(op.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete Forever
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

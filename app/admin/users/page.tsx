"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

type User = {
    id: string
    full_name: string
    mobile: string | null
    is_active: boolean
    created_at: string
}

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error

            setUsers(data || [])
        } catch (error: any) {
            console.error("Error fetching users:", error)
            toast({
                title: "Error",
                description: "Failed to load users.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const toggleUserStatus = async (id: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus

            setUsers(users.map(u =>
                u.id === id ? { ...u, is_active: newStatus } : u
            ))

            const { error } = await supabase
                .from("users")
                .update({ is_active: newStatus })
                .eq("id", id)

            if (error) {
                // Revert on error
                setUsers(users.map(u =>
                    u.id === id ? { ...u, is_active: currentStatus } : u
                ))
                throw error
            }

            toast({
                title: "User Updated",
                description: `User has been ${newStatus ? "activated" : "deactivated"}.`,
            })
        } catch (error: any) {
            console.error("Error updating user:", error)
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            })
        }
    }

    const filteredUsers = users.filter((user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.mobile && user.mobile.includes(searchQuery))
    )

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                    <p className="text-muted-foreground">View and control access for exclusive user accounts.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or mobile..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-blue-900">
                                        {user.full_name}
                                    </TableCell>
                                    <TableCell>
                                        {user.mobile || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(user.created_at), "PPP")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "default" : "destructive"}>
                                            {user.is_active ? "Active" : "Banned"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={user.is_active}
                                                onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {user.is_active ? "Access Granted" : "Access Revoked"}
                                            </span>
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

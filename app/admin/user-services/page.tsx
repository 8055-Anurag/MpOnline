"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, Search, Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type UserService = {
    id: string
    title: string
    description: string | null
    price: number
    operator_price: number | null // Added
    is_active: boolean
    created_at: string
    updated_at: string
    required_documents: string | null
    google_form_url: string
}

export default function ManageUserServicesPage() {
    const [services, setServices] = useState<UserService[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    // Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentServiceId, setCurrentServiceId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        operator_price: "", // Added
        required_documents: "",
        google_form_url: "",
        is_active: true
    })

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("user_services")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error

            setServices(data || [])
        } catch (error: any) {
            console.error("Error fetching services:", error)
            toast({
                title: "Error",
                description: "Failed to load services.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const toggleServiceStatus = async (id: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus

            setServices(services.map(s =>
                s.id === id ? { ...s, is_active: newStatus } : s
            ))

            const { error } = await supabase
                .from("user_services")
                .update({ is_active: newStatus })
                .eq("id", id)

            if (error) {
                // Revert on error
                setServices(services.map(s =>
                    s.id === id ? { ...s, is_active: currentStatus } : s
                ))
                throw error
            }

            toast({
                title: "Service Updated",
                description: `Service has been ${newStatus ? "enabled" : "disabled"}.`,
            })
        } catch (error: any) {
            console.error("Error updating service:", error)
            toast({
                title: "Error",
                description: "Failed to update service status.",
                variant: "destructive",
            })
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            price: "",
            operator_price: "", // Added
            required_documents: "",
            google_form_url: "",
            is_active: true
        })
        setIsEditing(false)
        setCurrentServiceId(null)
    }

    const handleOpenDialog = (service?: UserService) => {
        if (service) {
            setIsEditing(true)
            setCurrentServiceId(service.id)
            setFormData({
                title: service.title,
                description: service.description || "",
                price: service.price.toString(),
                operator_price: service.operator_price ? service.operator_price.toString() : "", // Added
                required_documents: service.required_documents || "",
                google_form_url: service.google_form_url,
                is_active: service.is_active
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (!formData.title || !formData.price || !formData.google_form_url) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields including Google Form URL.",
                    variant: "destructive"
                })
                return
            }

            const payload = {
                title: formData.title,
                price: parseFloat(formData.price),
                operator_price: formData.operator_price ? parseFloat(formData.operator_price) : null, // Added
                description: formData.description,
                is_active: formData.is_active,
                google_form_url: formData.google_form_url,
                required_documents: formData.required_documents,
                updated_at: new Date().toISOString()
            }

            if (isEditing && currentServiceId) {
                const { error } = await supabase
                    .from("user_services")
                    .update(payload)
                    .eq("id", currentServiceId)

                if (error) throw error
                toast({ title: "Success", description: "Service updated successfully." })
            } else {
                const { error } = await supabase
                    .from("user_services")
                    .insert([payload])

                if (error) throw error
                toast({ title: "Success", description: "Service created successfully." })
            }

            setIsDialogOpen(false)
            fetchServices()

        } catch (error: any) {
            console.error("Error saving service:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to save service.",
                variant: "destructive",
            })
        }
    }

    const filteredServices = services.filter((service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Exclusive Services</h1>
                    <p className="text-muted-foreground">Add, edit, or disable services visible ONLY to users.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add New User Service
                </Button>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search services..."
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
                            <TableHead>Service Name</TableHead>
                            <TableHead>User Price</TableHead>
                            <TableHead>Operator Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No services found. Click "Add New User Service" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">
                                        {service.title}
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {service.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>₹{service.price}</TableCell>
                                    <TableCell>{service.operator_price ? `₹${service.operator_price}` : '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={service.is_active}
                                                onCheckedChange={() => toggleServiceStatus(service.id, service.is_active)}
                                            />
                                            <Badge variant={service.is_active ? "outline" : "secondary"} className="text-xs">
                                                {service.is_active ? "Visible" : "Hidden"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
                                            <Edit className="h-4 w-4 text-blue-600" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Service" : "Add New User Service"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update existing service details." : "Create a new service exclusively for the User Dashboard."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="title">Service Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., PAN Card Application"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">User Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Visible to User</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="operator_price">Operator Price (₹)</Label>
                                <Input
                                    id="operator_price"
                                    type="number"
                                    min="0"
                                    value={formData.operator_price}
                                    onChange={(e) => setFormData({ ...formData, operator_price: e.target.value })}
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-muted-foreground">Visible to Operator (Cost)</p>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="google_form_url">Google Form URL</Label>
                                <Input
                                    id="google_form_url"
                                    value={formData.google_form_url}
                                    onChange={(e) => setFormData({ ...formData, google_form_url: e.target.value })}
                                    placeholder="https://forms.google.com/..."
                                    required
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">Full Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed explanation of the service..."
                                    className="h-24"
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="docs">Required Documents (comma separated)</Label>
                                <Input
                                    id="docs"
                                    value={formData.required_documents}
                                    onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
                                    placeholder="e.g., Aadhar Card, Photo, Signature"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2 col-span-2">
                                <Switch
                                    id="active-mode"
                                    checked={formData.is_active}
                                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                                />
                                <Label htmlFor="active-mode">Immediately make visible on User Dashboard?</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{isEditing ? "Save Changes" : "Create Service"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

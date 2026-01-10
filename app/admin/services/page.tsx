"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type CategoryRow = Database['public']['Tables']['categories']['Row']

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceRow | null>(null)

  // We'll manage requiredDocuments separately in state for UI convenience, then merge on save
  const [formData, setFormData] = useState<Partial<ServiceInsert>>({
    title: "",
    description: "",
    category_id: "",
    price: 0,
    processing_time: "",
    apply_url: "",
    required_documents: [],
    is_active: true,
    badge: null
  })
  const [documentInput, setDocumentInput] = useState("")

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true)
    const [servicesRes, categoriesRes] = await Promise.all([
      supabase.from('services').select('*').or('service_type.eq.global,service_type.is.null').order('created_at', { ascending: false }), // Filter for Global services
      supabase.from('categories').select('*').order('name')
    ])

    if (servicesRes.error) console.error('Error services:', servicesRes.error)
    if (categoriesRes.error) console.error('Error categories:', categoriesRes.error)

    setServices(servicesRes.data || [])
    setCategories(categoriesRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    setServices((prev) =>
      prev.map((service) => (service.id === id ? { ...service, is_active: !currentStatus } : service)),
    )

    const { error } = await supabase.from('services').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      console.error(error)
      fetchData() // Revert
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices((prev) => prev.filter((service) => service.id !== id))
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) {
        console.error(error)
        fetchData()
      }
    }
  }

  const handleEdit = (service: ServiceRow) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      category_id: service.category_id,
      price: service.price,
      processing_time: service.processing_time,
      apply_url: service.apply_url,
      required_documents: service.required_documents as string[] || [], // Type assertion for JSON
      is_active: service.is_active,
      badge: service.badge
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingService(null)
    setFormData({
      title: "",
      description: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      price: 0,
      processing_time: "",
      apply_url: "",
      required_documents: [],
      is_active: true,
      badge: null
    })
    setDocumentInput("")
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload: ServiceInsert = {
        title: formData.title || "",
        description: formData.description || "",
        category_id: formData.category_id || (categories[0]?.id || ""),
        price: Number(formData.price) || 0,
        slug: formData.slug || (formData.title || "").toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''), // Auto-generate slug if empty
        processing_time: formData.processing_time,
        apply_url: formData.apply_url || "",
        required_documents: formData.required_documents, // Supabase handles string[] -> jsonb
        is_active: formData.is_active,
        badge: formData.badge,
        service_type: 'global' // Explicitly set as global
      }

      if (editingService) {
        const { data, error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editingService.id)
          .select()

        if (error) throw error
        if (data && data.length > 0) {
          setServices(prev => prev.map(s => s.id === editingService.id ? data[0] : s))
        } else {
          // Fallback: If select() doesn't return data (e.g. RLS), we might need to fetch again or just close
          // For now, let's fetch fresh data to be safe
          fetchData()
        }
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert(payload)
          .select()

        if (error) throw error
        if (data && data.length > 0) {
          setServices(prev => [data[0], ...prev])
        } else {
          fetchData()
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Failed to save service')
    }
  }

  const addDocument = () => {
    if (documentInput.trim()) {
      const currentDocs = (formData.required_documents as string[]) || []
      setFormData({
        ...formData,
        required_documents: [...currentDocs, documentInput.trim()],
      })
      setDocumentInput("")
    }
  }

  const removeDocument = (index: number) => {
    const currentDocs = (formData.required_documents as string[]) || []
    setFormData({
      ...formData,
      required_documents: currentDocs.filter((_, i) => i !== index),
    })
  }

  // Helper to find category name
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-2">Manage all services across categories</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>System Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Processing Time</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">No services found</TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">Global Service</Badge>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{service.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{service.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {getCategoryName(service.category_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">₹{service.price}</TableCell>
                  <TableCell className="text-muted-foreground">{service.processing_time}</TableCell>
                  <TableCell>
                    {service.badge && (
                      <Badge variant={service.badge === "New" ? "default" : "destructive"} className="capitalize">
                        {service.badge}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!service.is_active} onCheckedChange={() => handleToggleActive(service.id, service.is_active)} />
                      <span className="text-sm">
                        {service.is_active ? (
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Update the service details" : "Create a new service"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Service title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingTime">Processing Time</Label>
                <Input
                  id="processingTime"
                  value={formData.processing_time || ""}
                  onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                  placeholder="7-10 days"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Select
                  value={formData.badge || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, badge: value === "none" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applyUrl">Apply URL</Label>
              <Input
                id="applyUrl"
                value={formData.apply_url}
                onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                placeholder="https://forms.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label>Required Documents</Label>
              <div className="flex gap-2">
                <Input
                  value={documentInput}
                  onChange={(e) => setDocumentInput(e.target.value)}
                  placeholder="Add document"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addDocument()
                    }
                  }}
                />
                <Button type="button" onClick={addDocument} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {((formData.required_documents as string[]) || []).map((doc, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeDocument(index)}
                  >
                    {doc} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={!!formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

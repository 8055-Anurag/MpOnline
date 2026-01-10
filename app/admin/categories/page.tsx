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
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

// Use the database type
type CategoryRow = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null)

  // Form state
  // We use partial for the form data, defaulting to empty strings
  const [formData, setFormData] = useState<CategoryInsert>({
    name: "",
    description: "",
    icon_name: "", // Changed from icon to icon_name to match DB
    slug: "",      // Changed from href/path to slug
    is_active: true,
  })

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    // Optimistic update
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, is_active: !currentStatus } : cat)))

    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error)
      // Revert if error
      fetchCategories()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      // Optimistic update
      setCategories((prev) => prev.filter((cat) => cat.id !== id))

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        fetchCategories()
      }
    }
  }

  const handleEdit = (category: CategoryRow) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon_name: category.icon_name,
      slug: category.slug,
      is_active: category.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      icon_name: "",
      slug: "",
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingCategory) {
        // Update existing
        const { data, error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id)
          .select()

        if (error) throw error

        // Update local state and verify
        if (data && data.length > 0) {
          setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? data[0] : cat))
        } else {
          // If no data returned, update might have failed (RLS) or just no return. Refetch to be safe.
          fetchCategories()
        }
      } else {
        // Add new
        const { data, error } = await supabase
          .from('categories')
          .insert(formData)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setCategories(prev => [data[0], ...prev])
        } else {
          fetchCategories()
        }
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(`Failed to save category: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-2">Manage service categories</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No categories found</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-md truncate">{category.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.icon_name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!category.is_active} onCheckedChange={() => handleToggleActive(category.id, category.is_active)} />
                      <span className="text-sm">
                        {category.is_active ? (
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
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details" : "Create a new service category"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Jobs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name (Lucide Icon)</Label>
              <Input
                id="icon"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                placeholder="e.g., Briefcase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL Path)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., jobs"
              />
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

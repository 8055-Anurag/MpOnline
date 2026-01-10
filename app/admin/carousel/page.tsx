"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ImageIcon } from "lucide-react"
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

type CarouselRow = Database['public']['Tables']['carousel']['Row']
type CarouselInsert = Database['public']['Tables']['carousel']['Insert']
type CarouselUpdate = Database['public']['Tables']['carousel']['Update']

export default function CarouselPage() {
  const [slides, setSlides] = useState<CarouselRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselRow | null>(null)

  const [formData, setFormData] = useState<Partial<CarouselInsert>>({
    title: "",
    subtitle: "",
    image_url: "", // Changed from image
    cta_text: "",  // Changed from ctaText
    cta_url: "",   // Changed from ctaLink
    is_active: true,
    display_order: 0 // Changed from order
  })

  const fetchSlides = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('carousel')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching slides:', error)
    } else {
      setSlides(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  // Sorted locally for UI (though DB should return sorted)
  const sortedSlides = [...slides].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    setSlides((prev) => prev.map((slide) => (slide.id === id ? { ...slide, is_active: !currentStatus } : slide)))
    // @ts-expect-error - Supabase type inference issue with update method
    await supabase.from('carousel').update({ is_active: !currentStatus }).eq('id', id)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      setSlides((prev) => prev.filter((slide) => slide.id !== id))
      await supabase.from('carousel').delete().eq('id', id)
    }
  }

  const handleEdit = (slide: CarouselRow) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      image_url: slide.image_url,
      cta_text: slide.cta_text,
      cta_url: slide.cta_url,
      is_active: slide.is_active,
      display_order: slide.display_order
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingSlide(null)
    const maxOrder = Math.max(...slides.map((s) => s.display_order || 0), 0)
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      cta_text: "",
      cta_url: "",
      is_active: true,
      display_order: maxOrder + 1
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingSlide) {
        // Update operation - use CarouselUpdate type
        const updatePayload: CarouselUpdate = {
          title: formData.title || "",
          subtitle: formData.subtitle || "",
          image_url: formData.image_url || "",
          cta_text: formData.cta_text || "",
          cta_url: formData.cta_url || "",
          display_order: formData.display_order || 0,
          is_active: formData.is_active
        }

        const { data, error } = await supabase
          .from('carousel')
          // @ts-expect-error - Supabase type inference issue with update method
          .update(updatePayload)
          .eq('id', editingSlide.id)
          .select()

        if (error) throw error
        if (data) setSlides(prev => prev.map(s => s.id === editingSlide.id ? data[0] : s))
      } else {
        // Insert operation - use CarouselInsert type
        const insertPayload: CarouselInsert = {
          title: formData.title || "",
          subtitle: formData.subtitle || "",
          image_url: formData.image_url || "",
          cta_text: formData.cta_text || "",
          cta_url: formData.cta_url || "",
          display_order: formData.display_order || 0,
          is_active: formData.is_active
        }

        const { data, error } = await supabase
          .from('carousel')
          // @ts-expect-error - Supabase type inference issue with insert method
          .insert(insertPayload)
          .select()

        if (error) throw error
        if (data) setSlides(prev => [...prev, data[0]])
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('Failed to save slide')
    }
  }

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const currentIndex = sortedSlides.findIndex((s) => s.id === id)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sortedSlides.length - 1)
    ) {
      return
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentSlide = sortedSlides[currentIndex]
    const targetSlide = sortedSlides[targetIndex]

    // Swap display_order
    const currentOrder = currentSlide.display_order || 0
    const targetOrder = targetSlide.display_order || 0

    // Optimistic UI update
    const newSlides = [...slides]
    const s1 = newSlides.find(s => s.id === currentSlide.id)
    const s2 = newSlides.find(s => s.id === targetSlide.id)
    if (s1) s1.display_order = targetOrder
    if (s2) s2.display_order = currentOrder
    setSlides(newSlides)

    // DB update
    // @ts-expect-error - Supabase type inference issue with update method
    await supabase.from('carousel').update({ display_order: targetOrder }).eq('id', currentSlide.id)
    // @ts-expect-error - Supabase type inference issue with update method
    await supabase.from('carousel').update({ display_order: currentOrder }).eq('id', targetSlide.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carousel</h1>
          <p className="text-muted-foreground mt-2">Manage homepage carousel slides</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead>CTA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">No slides found</TableCell>
              </TableRow>
            ) : (
              sortedSlides.map((slide, index) => (
                <TableRow key={slide.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{slide.display_order}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => moveSlide(slide.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => moveSlide(slide.id, "down")}
                          disabled={index === sortedSlides.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-20 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {slide.image_url ? (
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{slide.title}</div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-muted-foreground text-sm">{slide.subtitle}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{slide.cta_text}</div>
                      <div className="text-muted-foreground truncate max-w-[150px]">{slide.cta_url}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={!!slide.is_active} onCheckedChange={() => handleToggleActive(slide.id, slide.is_active)} />
                      <span className="text-sm">
                        {slide.is_active ? (
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
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(slide)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slide.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Edit Slide" : "Add Slide"}</DialogTitle>
            <DialogDescription>
              {editingSlide ? "Update the carousel slide details" : "Create a new carousel slide"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Slide title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Slide subtitle"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image_url || ""}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="/path/to/image.jpg"
              />
              {formData.image_url && (
                <div className="mt-2 w-full h-40 rounded overflow-hidden bg-muted">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ctaText">CTA Button Text</Label>
                <Input
                  id="ctaText"
                  value={formData.cta_text || ""}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="e.g., Learn More"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaLink">CTA Link</Label>
                <Input
                  id="ctaLink"
                  value={formData.cta_url || ""}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  placeholder="/services"
                />
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

"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/service-card"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Service = Database['public']['Tables']['services']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Fetch active categories
            const { data: catData } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order')

            // Fetch active services
            const { data: servData } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('display_order')

            setCategories(catData || [])
            setServices(servData || [])
            setLoading(false)
        }

        fetchData()
    }, [])

    const filteredServices = services.filter((service) => {
        const matchesSearch =
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = selectedCategory ? service.category_id === selectedCategory : true

        return matchesSearch && matchesCategory
    })

    return (
        <div className="container mx-auto px-4 py-12 md:px-6">
            <div className="flex flex-col space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Our Services</h1>
                    <p className="text-xl text-muted-foreground">
                        Explore our comprehensive range of government and digital services.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services (e.g. PAN Card, Samagra, Ration Card...)"
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <Button
                            variant={selectedCategory === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            className="whitespace-nowrap"
                        >
                            All Services
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category.id)}
                                className="whitespace-nowrap"
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Loader2 className="h-12 w-12 animate-spin mb-4" />
                        <p>Loading services...</p>
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => {
                            const category = categories.find(c => c.id === service.category_id);
                            // Ensure we meet the Service interface from ServiceCard
                            const mappedService = {
                                id: service.id,
                                title: service.title,
                                description: service.description,
                                documents: Array.isArray(service.required_documents)
                                    ? (service.required_documents as string[])
                                    : [],
                                price: service.price,
                                badge: service.badge || null,
                                applyUrl: service.apply_url,
                                category: category?.slug || 'general'
                            };

                            return (
                                <ServiceCard
                                    key={service.id}
                                    service={mappedService}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-24 border rounded-2xl bg-muted/30">
                        <div className="max-w-md mx-auto">
                            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No services found</h3>
                            <p className="text-muted-foreground mb-6">
                                We couldn't find any services matching "{searchQuery}". Try a different search term or category.
                            </p>
                            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

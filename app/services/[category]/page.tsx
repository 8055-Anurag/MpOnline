import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServicesList } from "@/components/services-list"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { Service } from "@/components/service-card"

export const revalidate = 0

// Define proper types
type CategoryRow = Database['public']['Tables']['categories']['Row']
type ServiceRow = Database['public']['Tables']['services']['Row']

export default async function ServicesPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params

  // 1. Fetch Category
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (categoryError || !categoryData) {
    console.error("Category not found:", categoryError)
    notFound()
  }

  // Type assertion to help TypeScript understand categoryData is non-null
  const category: CategoryRow = categoryData

  // 2. Fetch Services
  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)

  if (servicesError) {
    console.error("Error fetching services:", servicesError)
    // You might want to handle this error better, but for now we can show empty list or throw
  }

  // 3. Transform data to match Service interface
  const services: Service[] = (servicesData as ServiceRow[] || []).map(service => ({
    id: service.slug, // using slug as ID for URLs as per previous pattern, or use service.id
    title: service.title,
    description: service.description,
    documents: Array.isArray(service.required_documents)
      ? (service.required_documents as string[])
      : [], // Handle JSON type, assuming it's string[]
    price: service.price,
    badge: service.badge,
    applyUrl: service.apply_url,
    category: params.category
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl text-balance">
              {category.name}
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground text-pretty">{category.description}</p>
          </div>
        </section>

        {/* Services List Section */}
        <ServicesList services={services} />
      </main>

      <Footer />
    </div>
  )
}

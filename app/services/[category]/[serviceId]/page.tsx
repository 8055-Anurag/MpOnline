import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceDetail } from "@/components/service-detail"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"

// Type checking for Supabase response
interface ServiceData {
  id: string
  title: string
  description: string
  required_documents: string[] | any // Json type
  price: number
  badge: string | null
  apply_url: string
  processing_time: string | null
  category_id: string
  slug: string
  categories: {
    slug: string
  }
}

export async function generateStaticParams() {
  const { data: services } = await supabase
    .from('services')
    .select('slug, categories(slug)')
    .eq('is_active', true)

  if (!services) return []

  return services.map((service: any) => ({
    category: service.categories?.slug || 'jobs', // Fallback if join fails
    serviceId: service.slug,
  }))
}

export default async function ServiceDetailPage(props: { params: Promise<{ category: string; serviceId: string }> }) {
  const params = await props.params

  // Fetch service with category to ensure it matches the URL
  const { data: serviceData, error } = await supabase
    .from('services')
    .select('*, categories(slug)')
    .eq('slug', params.serviceId) // Assuming serviceId param is the slug
    .single()

  if (error || !serviceData) {
    notFound()
  }

  // Verify category matches (optional but good for strict routing)
  // @ts-ignore - Supabase type inference for join can be tricky
  const categorySlug = serviceData.categories?.slug
  // We allow loose matching or redirect if needed, but for now just showing content 
  // even if category URL param differs slightly is acceptable safe behavior, 
  // or we can 404 if mismatch. Let's trust the slug lookup.

  // Cast to any to bypass inference issues with join
  const data: any = serviceData

  const service = {
    id: data.id,
    title: data.title,
    description: data.description,
    documents: Array.isArray(data.required_documents)
      ? data.required_documents as string[]
      : [],
    price: data.price,
    badge: data.badge,
    applyUrl: data.apply_url,
    processingTime: data.processing_time || "N/A",
    category: categorySlug || "jobs", // Mapped from join
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <ServiceDetail service={service} />
      </main>

      <Footer />
    </div>
  )
}

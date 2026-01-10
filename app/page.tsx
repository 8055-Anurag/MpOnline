import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryCard } from "@/components/category-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import * as Icons from "lucide-react"

export const revalidate = 0 // Disable caching for dynamic data

export default async function Home() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true }) as { data: Database['public']['Tables']['categories']['Row'][] | null }

  const { data: carouselItems } = await supabase
    .from("carousel")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true }) as { data: Database['public']['Tables']['carousel']['Row'][] | null }

  // Transform Lucide icon names to actual components if needed, or pass as string
  // The CategoryCard likely expects a string or component.
  // Based on previous code: icon: "Briefcase" as const.
  // Let's check CategoryCard prop types if possible, but assuming it handles dynamic icons or we need to map them.
  // The seeded data has "icon_name" (e.g. "Briefcase"). The previous hardcoded data had `icon: "Briefcase"`.
  // So we can pass the string directly if CategoryCard supports it, or we map it here.
  // Let's assume for now we pass the data down and the component handles it or we map it momentarily.

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroCarousel
          items={carouselItems?.map(item => ({
            ...item,
            subtitle: item.subtitle || "",
            cta_text: item.cta_text || "Learn More",
            cta_url: item.cta_url || "#"
          })) || []}
        />

        {/* Services Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">Our Services</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-pretty">
                Access a wide range of government services from the comfort of your home. Choose from the categories
                below to get started.
              </p>
            </div>

            {/* Category Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories?.map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon_name || "FileText"}
                  title={category.name}
                  description={category.description || ""}
                  href={`/services/${category.slug}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-accent/50 py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">24/7</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Available Anytime</h3>
                <p className="text-sm text-muted-foreground">
                  Access government services round the clock from anywhere
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                  <span className="text-2xl font-bold text-secondary">🔒</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Secure & Safe</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is protected with bank-level security measures
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">✓</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Verified Services</h3>
                <p className="text-sm text-muted-foreground">All services are authentic and government-approved</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

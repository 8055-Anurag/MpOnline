"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, ExternalLink, FileText, Home, IndianRupee } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  title: string
  description: string
  documents: string[]
  price: number
  badge: string | null
  applyUrl: string
  processingTime: string
  category: string
}

interface ServiceDetailProps {
  service: Service
}

// Category labels for breadcrumb
const categoryLabels: Record<string, string> = {
  jobs: "Government Jobs",
  certificates: "Certificates",
  schemes: "Government Schemes",
  utilities: "Utility Services",
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const router = useRouter()

  const handleApplyClick = () => {
    window.open(service.applyUrl, "_blank", "noopener,noreferrer")
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-foreground focus:text-foreground"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
          </li>
          <li className="flex items-center gap-2">
            <Link
              href={`/services/${service.category}`}
              className="transition-colors hover:text-foreground focus:text-foreground"
            >
              {categoryLabels[service.category]}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </li>
          <li className="text-foreground font-medium">{service.title}</li>
        </ol>
      </nav>

      {/* Back Button */}
      <Button onClick={handleBackClick} variant="ghost" className="mb-6 -ml-3">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Services
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Title */}
          <div>
            <div className="mb-3 flex flex-wrap items-start gap-3">
              <h1 className="flex-1 text-3xl font-bold text-foreground md:text-4xl text-balance">{service.title}</h1>
              {service.badge && (
                <Badge variant={service.badge === "New" ? "default" : "secondary"} className="text-sm">
                  {service.badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground text-pretty">{service.description}</p>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                Required Documents
              </CardTitle>
              <CardDescription>Please ensure you have the following documents ready before applying</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {service.documents.map((doc, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                    <span className="leading-relaxed text-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fees Section */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <IndianRupee className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Application Fee</p>
                    <p className="text-2xl font-bold text-primary">
                      {service.price === 0 ? "Free" : `₹${service.price}`}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Processing Time */}
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
                  <p className="text-lg font-semibold text-foreground">{service.processingTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prominent Apply Button */}
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <Button onClick={handleApplyClick} size="lg" className="w-full text-base font-semibold shadow-lg">
                Apply Now
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You will be redirected to the application form
              </p>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>If you face any issues with the application process, please contact:</p>
              <p className="font-medium text-foreground">Helpline: 0755-4059-400</p>
              <p className="font-medium text-foreground">Email: support@mponline.gov.in</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export interface Service {
  id: string
  title: string
  description: string
  documents: string[]
  price: number
  badge: string | null
  applyUrl: string
  category: string
}

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="flex h-full flex-col transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="mb-2 flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-balance">{service.title}</CardTitle>
          {service.badge && (
            <Badge variant={service.badge === "New" ? "default" : "secondary"} className="shrink-0">
              {service.badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-pretty">{service.description}</p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Required Documents */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Required Documents:</h4>
          <ul className="space-y-1.5">
            {service.documents.slice(0, 3).map((doc, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{doc}</span>
              </li>
            ))}
            {service.documents.length > 3 && (
              <li className="text-sm text-muted-foreground pl-6">
                +{service.documents.length - 3} more document{service.documents.length - 3 > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
          <span className="text-sm font-medium text-accent-foreground">Application Fee:</span>
          <span className="text-lg font-bold text-primary">{service.price === 0 ? "Free" : `₹${service.price}`}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" size="lg">
          <Link href={`/services/${service.category}/${service.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Briefcase, FileText, Building2, Zap } from "lucide-react"

const iconMap = {
  Briefcase,
  FileText,
  Building2,
  Zap,
} as const

interface CategoryCardProps {
  icon: string
  title: string
  description: string
  href: string
  className?: string
}

export function CategoryCard({ icon, title, description, href, className }: CategoryCardProps) {
  // @ts-ignore - Dynamic icon name lookup
  const Icon = iconMap[icon] || Briefcase

  return (
    <Link href={href}>
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          className,
        )}
      >
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4 transition-colors duration-300 group-hover:bg-primary/20">
            <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

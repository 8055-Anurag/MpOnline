"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
]

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const NavContent = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "font-medium transition-colors hover:text-primary",
              mobile ? "text-lg" : "text-sm",
              isActive ? "text-primary" : "text-foreground"
            )}
          >
            {item.name}
          </Link>
        )
      })}
      {!loading && (
        <Button asChild variant="default" size={mobile ? "lg" : "sm"} className={mobile ? "mt-4" : "ml-4"}>
          <Link href="/login">
            Login
          </Link>
        </Button>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
            MP
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-foreground">MPOnline</span>
            <span className="text-xs text-muted-foreground">Service Center</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          <NavContent />
        </nav>

        {/* Mobile Navigation */}
        {!mounted ? (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <NavContent mobile />
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  )
}

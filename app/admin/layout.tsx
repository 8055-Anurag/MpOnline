"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  ImageIcon,
  LogOut,
  Loader2,
  User,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Users,
  Settings,
  CreditCard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth" // Using existing import path preference
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Navigation Structure Definition
type NavItem = {
  title: string
  href: string
}

type NavCategory = {
  title: string
  icon: React.ElementType
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", href: "/admin" },
      { title: "Manage Services", href: "/admin/services" },
      { title: "Manage Categories", href: "/admin/categories" },
      { title: "Manage Carousel", href: "/admin/carousel" },
    ]
  },
  {
    title: "Operator",
    icon: Briefcase,
    items: [
      { title: "Operator Requests", href: "/admin/operator-requests" },
      { title: "Operators List", href: "/admin/operators" },
      { title: "Operator Applications", href: "/admin/operator-applications" },
      { title: "Relist Applications", href: "/admin/applications" }, // Using main apps page for management
    ]
  },
  {
    title: "User",
    icon: Users,
    items: [
      { title: "Users List", href: "/admin/users" },
      { title: "User Applications", href: "/admin/user-applications" },
      { title: "Manage User Services", href: "/admin/user-services" },
      { title: "User Access", href: "/admin/user-access" },
      { title: "Support", href: "/admin/support" },
    ]
  }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // State for collapsible sections - Default to Dashboard open
  const [openCategory, setOpenCategory] = useState<string | null>("Dashboard")

  // Redirect to login if not authenticated or not authorized
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login")
      } else if (user && pathname !== "/admin/login") {
        // Enforce Strict Admin Email Check
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
        if (adminEmail && user.email !== adminEmail) {
          // Not the admin -> redirect to home
          router.push("/")
        }
      }
    }
  }, [user, loading, pathname, router])

  // Automatically expand category if active page is within it
  useEffect(() => {
    const activeCategory = navCategories.find(cat =>
      cat.items.some(item => item.href === pathname)
    )
    if (activeCategory) {
      setOpenCategory(activeCategory.title)
    }
  }, [pathname])

  const handleLogout = async () => {
    await signOut()
    router.push("/admin/login")
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render admin layout if not authenticated or not authorized (except for login page)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const isAuthorized = user && (!adminEmail || user.email === adminEmail)

  if ((!user || !isAuthorized) && pathname !== "/admin/login") {
    return null
  }

  // Render login page without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col overflow-y-auto">
        <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span>Admin Panel</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-2 p-4 flex-1">
          {navCategories.map((category) => {
            const Icon = category.icon
            const isOpen = openCategory === category.title

            return (
              <Collapsible
                key={category.title}
                open={isOpen}
                onOpenChange={(open) => {
                  if (open) setOpenCategory(category.title)
                  else if (openCategory === category.title) setOpenCategory(null)
                }}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between font-normal hover:bg-muted">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.title}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-4 py-1">
                  {category.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors block",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>

        {/* User info and logout */}
        <div className="border-t mt-auto">
          {user && (
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground justify-center"
              >
                Back to Website
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}

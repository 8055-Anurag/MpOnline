"use client"

import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileStack, ClipboardList, LogOut, Loader2, User, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/operator/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Available Applications",
        href: "/operator/applications/available",
        icon: FileStack,
    },
    {
        title: "My Applications",
        href: "/operator/applications/my",
        icon: ClipboardList,
    },
]

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading, signOut } = useAuth()

    // Redirect to login if not authenticated
    // Note: specific operator role check would ideally happen here too
    useEffect(() => {
        const publicRoutes = ["/operator/login", "/operator/register"]
        if (!loading && !user && !publicRoutes.includes(pathname)) {
            router.push("/operator/login")
        }
    }, [user, loading, pathname, router])

    const handleLogout = async () => {
        await signOut()
        router.push("/operator/login")
    }

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    // Public pages layout (no sidebar)
    if (pathname === "/operator/login" || pathname === "/operator/register") {
        return <>{children}</>
    }

    // Don't render dashboard layout if not authenticated (handled by effect, but prevents flash)
    if (!user && pathname !== "/operator/login" && pathname !== "/operator/register") {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shadow-sm">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/operator" className="flex items-center gap-2 font-semibold text-lg text-gray-900">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                        <span>Operator Panel</span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-1 p-4 flex-1">
                    {sidebarItems.map((item) => {
                        // Simple active check: exact match or starts with (for sub-routes)
                        // Handling the root /operator case carefully
                        const isActive = pathname.startsWith(item.href)

                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-500")} />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>

                {/* User info and logout */}
                <div className="border-t p-4 bg-gray-50/50">
                    {user && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-700" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-gray-900 truncate">Operator</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Header matching the design aesthetic */}
                <header className="h-16 border-b bg-white flex items-center px-8 justify-between sticky top-0 z-10">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {sidebarItems.find(item => pathname === item.href || (item.href !== "/operator" && pathname.startsWith(item.href)))?.title || "Dashboard"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">System Status: Online</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

export default function UserLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const { signIn, signOut } = useAuth()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!email || !password) {
            setError("Please enter both email and password")
            setLoading(false)
            return
        }

        try {
            const { error: signInError } = await signIn(email, password)
            if (signInError) {
                setError("Invalid credentials")
            } else {
                // Strict Isolation Check: Verify user exists in 'users' table
                const { supabase } = await import("@/lib/supabase")

                // Get the current user session details
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    await signOut()
                    setError("Authentication failed.")
                    return
                }

                const { data: userRecord, error: userError } = await supabase
                    .from("users")
                    .select("id, is_active")
                    .eq("id", user.id)
                    .single()

                if (userError || !userRecord) {
                    // Start cleanup if not a valid user
                    await signOut()
                    setError("Access denied. Invalid user role.")
                } else if (!userRecord.is_active) {
                    await signOut()
                    setError("Your account has been deactivated. Please contact support.")
                } else {
                    router.push("/user/dashboard")
                }
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            {/* Back to Home Link */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-primary">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Logo/Branding */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                        MP
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">MPOnline Service Portal</h1>
                    <p className="text-sm text-gray-500">Citizen Services Login</p>
                </div>

                <Card className="border-t-4 border-t-blue-600 shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/user/forgot-password"
                                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <p>
                            Don&apos;t have an account?{" "}
                            <Link href="/user/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                Create new account
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} MPOnline. All rights reserved.
                </p>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldCheck, LockKeyhole } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function OperatorLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const { signIn, signOut } = useAuth()

    // We utilize the imported supabase client for checking the profile status 
    // immediately after login and BEFORE redirecting.

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            // 1. Attempt Authentication
            const { error: signInError } = await signIn(email, password)

            if (signInError) {
                setError(signInError.message)
                setIsLoading(false)
                return
            }

            // 2. Check Operator Status
            // We need to verify if the account is approved (is_active = true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: operator, error: profileError } = await supabase
                    .from('operators') // Query the correct table
                    .select('is_active')
                    .eq('id', user.id)
                    .single()

                if (profileError || !operator) {
                    // Profile missing or error
                    await signOut()
                    setError("Operator profile not found. Please contact support.")
                    setIsLoading(false)
                    return
                }

                // Operators table implies role='operator', so we don't need to check role field (it might not exist on operators table)
                // If you added 'role' column to operators table, you can check it, but table separation makes it implicit.

                if (!operator.is_active) {
                    // Account exists but is pending approval
                    await signOut()
                    setError("Your account is pending admin approval. You cannot login yet.")
                    setIsLoading(false)
                    return
                }

                // 3. Success - Redirect
                router.push("/operator/dashboard")
            } else {
                setError("Authentication failed. Please try again.")
                setIsLoading(false)
            }

        } catch (err) {
            console.error("Login error:", err)
            setError("An unexpected error occurred. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto bg-blue-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 ring-1 ring-blue-100">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                        Operator Login
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Secure access for authorized personnel only
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="operator@mponline.gov.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="pl-10"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <LockKeyhole className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying Credentials...
                                </>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-center">
                            <p className="text-sm text-gray-600">New operator?</p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                asChild
                            >
                                <Link href="/operator/register">
                                    Create an Operator Account
                                </Link>
                            </Button>
                            <p className="text-[10px] text-gray-400">
                                Operator accounts require admin approval before activation
                            </p>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t bg-gray-50/50 p-6">
                    <p className="text-sm text-center text-gray-500">
                        Having trouble accessing your account?
                    </p>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                        Contact System Administrator
                    </Link>
                    <div className="mt-4 text-xs text-gray-400 text-center max-w-xs">
                        Unauthorized access to this portal is prohibited and monitored.
                    </div>
                </CardFooter>
            </Card>

            {/* Decorative footer/copyright for official feel */}
            <div className="absolute bottom-6 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} MPOnline Service Portal. All rights reserved.
            </div>
        </div>
    )
}

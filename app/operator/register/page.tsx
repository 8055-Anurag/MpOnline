"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Mail, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function OperatorRegistrationPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        category: "",
        experience: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isPartialSuccess, setIsPartialSuccess] = useState(false) // Auth worked, Profile failed
    const [userId, setUserId] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }))
    }

    const createProfile = async (uid: string) => {
        const { error: profileError } = await supabase
            .from('operator_requests')
            .insert({
                user_id: uid, // Link to Auth User
                full_name: formData.fullName,
                email: formData.email,
                mobile: formData.mobile,
                status: 'pending'
            })

        if (profileError) throw profileError
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.")
            return
        }

        setIsLoading(true)

        try {
            // 1. Sign Up using Supabase Auth
            // We pass 'operator' role in metadata, which the DB trigger uses to route to 'operators' table
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        mobile: formData.mobile,
                        role: 'operator' // CRITICAL: This routes to public.operators via Trigger
                    }
                }
            })

            if (authError) throw authError

            // Trigger handles the DB insertion into 'operators' table.

            setIsSuccess(true)
        } catch (err: any) {
            console.error("Registration error:", err)
            setError(err.message || "Failed to submit request.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-600 text-center p-6">
                    <CardHeader>
                        <div className="mx-auto bg-green-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 ring-1 ring-green-100">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Request Submitted</CardTitle>
                        <CardDescription className="text-base text-gray-600 mt-2">
                            Your request to join as an operator has been submitted successfully.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md border border-blue-100">
                            <strong>Note:</strong> Operator accounts require admin approval. You will be notified via email or you can check your status by logging in.
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                            <Link href="/operator/login">Back to Operator Login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Partial success state removed as it is no longer relevant with atomic auth trigger
    if (isPartialSuccess) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <Card className="w-full max-w-xl shadow-lg border-t-4 border-t-blue-600">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto bg-blue-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 ring-1 ring-blue-100">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                        Operator Registration
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Request access to work as an authorized operator
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p>
                                <strong>Important:</strong> Operator accounts require manual approval by the system administrator. You will not be able to log in immediately after registration.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                                <Input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="operator@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Preferred Service Category <span className="text-red-500">*</span></Label>
                            <Select onValueChange={handleCategoryChange} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="civil_services">Citizen Services (Caste/Income/Domicile)</SelectItem>
                                    <SelectItem value="utilities">Utility Payments & Bills</SelectItem>
                                    <SelectItem value="academic">Academic & University Services</SelectItem>
                                    <SelectItem value="business">Business & Licensing</SelectItem>
                                    <SelectItem value="other">Other / General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience / Notes (Optional)</Label>
                            <Textarea
                                id="experience"
                                name="experience"
                                placeholder="Any previous experience or qualifications..."
                                className="min-h-[80px]"
                                value={formData.experience}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting Request...
                                    </>
                                ) : (
                                    "Submit Registration Request"
                                )}
                            </Button>
                            <div className="text-center text-sm">
                                <Link href="/operator/login" className="text-blue-600 hover:underline">
                                    Already have an account? Back to Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

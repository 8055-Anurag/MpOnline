import Link from "next/link"
import { Shield, Users, ShieldCheck, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LoginSelectionPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="text-center mb-10 space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Portal Login</h1>
                <p className="text-lg text-gray-500">Select your role to continue to the dashboard</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Operator Card */}
                <Card className="hover:shadow-xl transition-all duration-300 border-blue-100 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <CardHeader className="text-center pt-10 pb-6">
                        <div className="mx-auto bg-blue-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-10 h-10 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Operator Login</CardTitle>
                        <CardDescription>
                            For authorized center operators and staff members
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 px-8">
                        <ul className="text-sm text-gray-500 space-y-2 mb-6">
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Process Applications
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Manage Service Requests
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                View Assigned Tasks
                            </li>
                        </ul>
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                            <Link href="/operator/login">
                                Continue as Operator
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* User Card */}
                <Card className="hover:shadow-xl transition-all duration-300 border-green-100 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                    <CardHeader className="text-center pt-10 pb-6">
                        <div className="mx-auto bg-green-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <User className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">User Login</CardTitle>
                        <CardDescription>
                            For citizens and general users
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 px-8">
                        <ul className="text-sm text-gray-500 space-y-2 mb-6">
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Browse Services
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Track Applications
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Manage Profile
                            </li>
                        </ul>
                        <Button asChild variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800" size="lg">
                            <Link href="/user/login">
                                Continue as User
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 text-center text-sm text-gray-400">
                <p>Forgot your credentials? <Link href="/contact" className="text-gray-600 hover:underline">Contact Support</Link></p>
            </div>
        </div>
    )
}

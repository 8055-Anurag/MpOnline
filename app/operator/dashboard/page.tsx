"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, CheckCircle2, Clock, FileStack, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export default function OperatorDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        available: 0,
        accepted: 0,
        pending: 0,
        completed: 0
    })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return

            try {
                // fetch available apps (status=submitted, operator_id=null)
                const { count: availableCount } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'submitted')
                    .is('operator_id', null)

                // fetch my accepted apps (status!=submitted, operator_id=user.id)
                const { count: acceptedCount } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .neq('status', 'submitted')
                    .eq('operator_id', user.id)

                // fetch my pending apps (status=under_review, operator_id=user.id)
                const { count: pendingCount } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'under_review')
                    .eq('operator_id', user.id)

                // fetch my completed apps (status=completed, operator_id=user.id)
                const { count: completedCount } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'completed')
                    .eq('operator_id', user.id)

                // Fetch Recent Activity
                const { data: recentApps } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('operator_id', user.id)
                    .order('updated_at', { ascending: false }) // Use updated_at for activity flow
                    .limit(5)

                setStats({
                    available: availableCount || 0,
                    accepted: acceptedCount || 0,
                    pending: pendingCount || 0,
                    completed: completedCount || 0
                })
                setRecentActivity(recentApps || [])
            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user])

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Operator Dashboard</h2>
                <p className="text-muted-foreground mt-2">Overview of your workload and performance.</p>
            </div>

            {/* Stats Cards Grid - Unchanged */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Available Applications */}
                <Link href="/operator/applications/available" className="block">
                    <Card className="hover:shadow-md transition-shadow border-blue-100 bg-blue-50/50 cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900">Available Apps</CardTitle>
                            <FileStack className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">{loading ? "-" : stats.available}</div>
                            <p className="text-xs text-blue-600/80 mt-1">Ready to accept</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Accepted by Me */}
                <Link href="/operator/applications/my" className="block">
                    <Card className="hover:shadow-md transition-shadow border-indigo-100 bg-indigo-50/50 cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-900">My Applications</CardTitle>
                            <ClipboardList className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-700">{loading ? "-" : stats.accepted}</div>
                            <p className="text-xs text-indigo-600/80 mt-1">Total assigned to you</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending / Under Review */}
                <Card className="hover:shadow-md transition-shadow border-orange-100 bg-orange-50/50 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-900">Under Review</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{loading ? "-" : stats.pending}</div>
                        <p className="text-xs text-orange-600/80 mt-1">Waiting for action</p>
                    </CardContent>
                </Card>

                {/* Completed */}
                <Card className="hover:shadow-md transition-shadow border-green-100 bg-green-50/50 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{loading ? "-" : stats.completed}</div>
                        <p className="text-xs text-green-600/80 mt-1">Processed successfully</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <div className="text-sm text-center py-4">Loading...</div>
                            ) : recentActivity.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    No recent activity to show.
                                </div>
                            ) : (
                                recentActivity.map((app) => (
                                    <div key={app.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">{app.applicant_name}</p>
                                            <p className="text-xs text-muted-foreground">{app.service_name}</p>
                                            <p className="text-[10px] text-gray-400">ID: {app.application_no}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'under_review' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(app.updated_at || app.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-blue-100 text-sm">Manage your workflow efficiently.</p>
                        <Link href="/operator/applications/available" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md py-3 px-4 flex items-center justify-between transition-colors group">
                            <span className="flex items-center gap-2">
                                <FileStack className="h-4 w-4" />
                                Accept New Application
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link href="/operator/applications/my" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md py-3 px-4 flex items-center justify-between transition-colors group">
                            <span className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Update Application Status
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY or URL")
        return NextResponse.json({ error: 'Server misconfiguration: Missing Environment Variables' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        const { requestId } = await request.json()

        if (!requestId) {
            return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })
        }

        // 1. Update Operator Status
        const { error: updateError } = await supabaseAdmin
            .from('operators')
            .update({ is_active: true })
            .eq('id', requestId)

        if (updateError) {
            console.error("Operator Approval Error:", updateError)
            return NextResponse.json({ error: 'Failed to approve operator' }, { status: 500 })
        }

        return NextResponse.json({ success: true, userId: requestId })

    } catch (error: any) {
        console.error("Approval API Error:", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

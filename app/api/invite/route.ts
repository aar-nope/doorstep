import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const { name, email, groupId } = await request.json()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
            },
        }
    )

    // Check requester is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
    }

    // Check requester is an admin/owner of this group
    const { data: requester } = await supabase
        .from('members')
        .select('id, role, group_id, group:groups(name, slug)')
        .eq('auth_id', user.id)
        .eq('group_id', groupId)
        .eq('is_active', true)
        .single()

    if (!requester || !['owner', 'admin'].includes(requester.role)) {
        return NextResponse.json({ error: 'not authorized' }, { status: 403 })
    }

    // Check member limit
    const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('is_active', true)

    if (count && count >= 30) {
        return NextResponse.json(
            { error: 'group is at the 30 member limit' },
            { status: 400 }
        )
    }

    // Check not already a member
    const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('group_id', groupId)
        .eq('email', email)
        .maybeSingle()

    if (existing) {
        return NextResponse.json(
            { error: 'this person is already in the group' },
            { status: 400 }
        )
    }

    // Admin client to bypass RLS for the insert
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    )

    const { data: newMember, error: insertError } = await adminClient
        .from('members')
        .insert({
            group_id: groupId,
            email,
            name,
            display_name: name,
            role: 'member',
            invited_by: requester.id,
            onboarded: false,
        })
        .select()
        .single()

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Get group details for email
    const groupData = Array.isArray(requester.group)
        ? requester.group[0]
        : requester.group
    const group = groupData as { name: string; slug: string }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    // Send invite email via Resend
    const { error: emailError } = await resend.emails.send({
        from: 'Doorstep <hello@doorstep.app>',
        to: email,
        subject: `you've been invited to ${group.name} on doorstep 🪴`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="max-width: 520px; margin: 48px auto; padding: 0 24px;">
            <div style="background: white; border-radius: 16px; border: 1px solid #f1ede8; padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="font-size: 32px; margin: 0 0 8px;">🪴</p>
                <h1 style="font-size: 22px; font-weight: 700; color: #1c1917; margin: 0 0 8px;">
                  you're invited to ${group.name}
                </h1>
                <p style="font-size: 14px; color: #78716c; margin: 0;">
                  a monthly newsletter for people who actually care about each other
                </p>
              </div>
              <p style="font-size: 15px; color: #44403c; line-height: 1.6; margin: 0 0 24px;">
                hey ${name} 👋 — someone added you to <strong>${group.name}</strong> on doorstep. every month, everyone answers a few questions and it gets turned into a little newsletter just for your group.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a 
                  href="${appUrl}/auth"
                  style="background-color: #1c1917; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 500;"
                >
                  join the group →
                </a>
              </div>
              <p style="font-size: 13px; color: #a8a29e; text-align: center; margin: 24px 0 0;">
                just use the email this was sent to — no password needed.
              </p>
            </div>
            <p style="font-size: 12px; color: #d6d3d1; text-align: center; margin-top: 24px;">
              doorstep · your monthly letter from the people you love
            </p>
          </div>
        </body>
      </html>
    `,
    })

    if (emailError) {
        console.error('invite email failed:', emailError)
    }

    return NextResponse.json({ member: newMember })
}
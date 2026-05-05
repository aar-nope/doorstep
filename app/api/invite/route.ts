import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const { memberId, groupId } = await request.json()

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

  // Check requester is admin/owner of this group
  const { data: requester } = await supabase
    .from('members')
    .select('id, role')
    .eq('auth_id', user.id)
    .eq('group_id', groupId)
    .eq('is_active', true)
    .single()

  if (!requester || !['owner', 'admin'].includes(requester.role)) {
    return NextResponse.json({ error: 'not authorized' }, { status: 403 })
  }

  // Get the member being removed to check their role
  const { data: targetMember } = await supabase
    .from('members')
    .select('id, role')
    .eq('id', memberId)
    .eq('group_id', groupId)
    .single()

  if (!targetMember) {
    return NextResponse.json({ error: 'member not found' }, { status: 404 })
  }

  // Cannot remove the owner
  if (targetMember.role === 'owner') {
    return NextResponse.json({ error: 'cannot remove the owner' }, { status: 403 })
  }

  // Cannot remove yourself
  if (targetMember.id === requester.id) {
    return NextResponse.json({ error: 'cannot remove yourself' }, { status: 403 })
  }

  // Soft delete via admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { error } = await adminClient
    .from('members')
    .update({ is_active: false })
    .eq('id', memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
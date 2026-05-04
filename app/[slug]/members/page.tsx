import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MembersClient from '@/components/MembersClient'

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Get current member + their group
  const { data: currentMember } = await supabase
    .from('members')
    .select('*, group:groups(*)')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single()

  if (!currentMember) redirect('/dashboard')

  // Get all members in this group
  const { data: allMembers } = await supabase
    .from('members')
    .select('*')
    .eq('group_id', currentMember.group_id)
    .eq('is_active', true)
    .order('joined_at', { ascending: true })

  return (
    <MembersClient
      currentMember={currentMember}
      allMembers={allMembers || []}
      groupId={currentMember.group_id}
    />
  )
}
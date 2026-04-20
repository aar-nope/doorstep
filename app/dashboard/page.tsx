import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Member, Group } from '@/lib/types'
import CreateGroupForm from '@/components/CreateGroupForm'
import GroupDashboard from '@/components/GroupDashboard'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Check if they're in any groups
  const { data: member } = await supabase
    .from('members')
    .select('*, group:groups(*)')
    .eq('email', user.email!)
    .eq('is_active', true)
    .limit(1)
    .single()

  // First time user — show create group screen
  if (!member) {
    return <CreateGroupForm email={user.email!} />
  }

  // Existing user — show their group dashboard
  return <GroupDashboard member={member as Member & { group: Group }} />
}
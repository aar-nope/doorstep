import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SidebarNav from '@/components/SidebarNav'

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  const { data: member } = await supabase
    .from('members')
    .select('*, group:groups(*)')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <SidebarNav member={member} slug={slug} />
      <main className="flex-1 p-8 ml-64">
        {children}
      </main>
    </div>
  )
}
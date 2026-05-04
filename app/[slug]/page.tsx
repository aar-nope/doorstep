import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function GroupSummaryPage({
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

  const { data: member } = await supabase
    .from('members')
    .select('*, group:groups(*)')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) redirect('/dashboard')

  const group = member.group

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">
          ✨ summary
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
        <h2 className="font-medium text-stone-800">details</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-400">created on</span>
            <span className="text-stone-800 font-medium">
              {new Date(group.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">delivery</span>
            <span className="text-stone-800 font-medium capitalize">
              {group.delivery_frequency}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">your role</span>
            <span className="text-stone-800 font-medium capitalize">
              {member.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
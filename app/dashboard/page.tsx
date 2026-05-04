import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CreateGroupForm from '@/components/CreateGroupForm'
import Link from 'next/link'
import { Member, Group } from '@/lib/types'

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
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Get ALL groups this person belongs to
  const { data: members } = await supabase
    .from('members')
    .select('*, group:groups(*)')
    .eq('auth_id', user.id)
    .eq('is_active', true)

  // No groups yet — show create form
  if (!members || members.length === 0) {
    return <CreateGroupForm email={user.email!} />
  }

  // Has groups — show list
  return (
    <main className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800">
            doorstep 🪴
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            your newsletters
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {members.map((member: Member & { group: Group }) => (
            <Link
              key={member.id}
              href={`/${member.group.slug}`}
              className="bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-300 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-white font-medium">
                  {member.group.name[0]}
                </div>
                <div>
                  <p className="font-medium text-stone-800">
                    {member.group.name}
                  </p>
                  <p className="text-stone-400 text-xs capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              <span className="text-stone-300 group-hover:text-stone-500 transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/create"
          className="mt-6 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          + create another group
        </Link>

      </div>
    </main>
  )
}
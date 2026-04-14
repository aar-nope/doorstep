import { Member, Group } from '@/lib/types'

export default function GroupDashboard({ 
  member 
}: { 
  member: Member & { group: Group } 
}) {
  return (
    <main className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">
            {member.group.name} 🪴
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            welcome back, {member.display_name || member.name}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <p className="text-stone-500 text-sm">
            dashboard coming soon — you're logged in as {member.role}
          </p>
        </div>
      </div>
    </main>
  )
}
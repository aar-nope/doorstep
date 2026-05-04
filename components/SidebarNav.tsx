'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Member, Group } from '@/lib/types'

type Props = {
  member: Member & { group: Group }
  slug: string
}

const navItems = [
  { label: '✨ summary', path: '' },
  { label: '📋 issues', path: '/issues' },
  { label: '🌿 members', path: '/members' },
  { label: '🗓 schedule', path: '/schedule' },
  { label: '💬 questions', path: '/questions' },
  { label: '⚙️ settings', path: '/settings' },
]

export default function SidebarNav({ member, slug }: Props) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-stone-100 flex flex-col">
      
      {/* Group name */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {member.group.name[0]}
          </div>
          <div>
            <p className="font-medium text-stone-800 text-sm">
              {member.group.name}
            </p>
            <p className="text-stone-400 text-xs capitalize">
              {member.role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(item => {
          const href = `/${slug}${item.path}`
          const isActive = item.path === ''
            ? pathname === `/${slug}`
            : pathname.startsWith(href)

          return (
            <Link
              key={item.path}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-stone-100 text-stone-800 font-medium'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-stone-100">
        <p className="text-xs text-stone-400">
          {member.display_name || member.name}
        </p>
        <p className="text-xs text-stone-300">
          {member.email}
        </p>
      </div>
    </aside>
  )
}
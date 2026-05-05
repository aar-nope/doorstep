'use client'

import { useState } from 'react'
import { Member } from '@/lib/types'

type Props = {
  currentMember: Member
  allMembers: Member[]
  groupId: string
}

const roleColors: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700',
  admin: 'bg-blue-50 text-blue-700',
  member: 'bg-stone-50 text-stone-600',
}

export default function MembersClient({
  currentMember,
  allMembers,
  groupId,
}: Props) {
  const [members, setMembers] = useState<Member[]>(allMembers)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAdmin = currentMember.role === 'owner' || currentMember.role === 'admin'
  const maxMembers = 30

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const response = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, groupId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setMembers(prev => [...prev, data.member])
    setSuccess(`${name} has been added! they'll get an invite email shortly.`)
    setName('')
    setEmail('')
    setLoading(false)
  }

  async function handleRemove(memberId: string) {
    if (!confirm('are you sure you want to remove this member?')) return

    const response = await fetch('/api/remove-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, groupId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error)
      return
    }

    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">
          🌿 members
        </h1>
        <span className="text-stone-400 text-sm">
          {members.length}/{maxMembers}
        </span>
      </div>

      {/* Member list */}
      <div className="bg-white rounded-2xl border border-stone-100 mb-6 overflow-hidden">
        {members.map((member, i) => (
          <div
            key={member.id}
            className={`flex items-center justify-between px-5 py-4 ${
              i !== members.length - 1 ? 'border-b border-stone-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 text-sm font-medium">
                {member.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {member.display_name || member.name}
                </p>
                <p className="text-xs text-stone-400">
                  {member.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${roleColors[member.role]}`}>
                {member.role}
              </span>

              {isAdmin &&
                member.id !== currentMember.id &&
                member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="text-stone-300 hover:text-red-400 transition-colors text-sm"
                  >
                    remove
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite form — admins only */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">
            invite someone
          </h2>

          <form onSubmit={handleInvite} className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="their name"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="their email"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-stone-800 text-white rounded-xl py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'adding...' : 'send invite ✉️'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
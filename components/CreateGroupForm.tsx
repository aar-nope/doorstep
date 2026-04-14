'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreateGroupForm({ email }: { email: string }) {
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toSlug(str: string) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = toSlug(name)

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name, slug })
      .select()
      .single()

    if (groupError) {
      setError(groupError.message)
      setLoading(false)
      return
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        group_id: group.id,
        email,
        name: displayName,
        display_name: displayName,
        role: 'owner',
        onboarded: true
      })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 w-full max-w-md">
        
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">🪴</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            create your doorstep
          </h1>
          <p className="text-stone-500 text-sm">
            start a monthly newsletter for your people
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-stone-600 mb-1 block">
              your name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="how your friends know you"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1 block">
              group name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. the cuties, apartment 4b"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            {name && (
              <p className="text-xs text-stone-400 mt-1">
                your url: doorstep.app/{toSlug(name)}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-stone-800 text-white rounded-xl py-3 font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'creating...' : 'create group ✨'}
          </button>
        </form>
      </div>
    </main>
  )
}
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://doorstep-lemon.vercel.app/auth/callback'
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/auth/verify'
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            doorstep 🪴
          </h1>
          <p className="text-stone-500 text-sm">
            your monthly letter from the people you love
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-stone-600 mb-1 block">
              email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-stone-800 text-white rounded-xl py-3 font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'sending...' : 'send me a magic link ✨'}
          </button>
        </form>

        <p className="text-center text-stone-400 text-xs mt-6">
          no password needed. ever.
        </p>
      </div>
    </main>
  )
}
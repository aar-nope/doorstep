'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    // Handle the token when user lands back on /auth after clicking magic link
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/dashboard'
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 w-full max-w-md text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            check your inbox
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            we sent you a magic link — click it and you'll be right in.
          </p>
          <p className="text-stone-400 text-xs mt-4">
            didn't get it? check your spam folder.
          </p>
        </div>
      </main>
    )
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
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConfirmPage() {
  useEffect(() => {
    // Handle the hash-based token from legacy magic links
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/dashboard'
      }
    })
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="text-4xl mb-4">🪴</div>
        <p className="text-stone-500 text-sm">signing you in...</p>
      </div>
    </main>
  )
}
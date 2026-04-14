import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Temporary debug - shows us exactly what's arriving
  console.log('Callback hit:', {
    fullUrl: request.url,
    code: code ? 'EXISTS' : 'MISSING',
    error,
    errorDescription,
    allParams: Object.fromEntries(requestUrl.searchParams)
  })

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${errorDescription}`, request.url)
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Session exchange result:', sessionError ? sessionError.message : 'SUCCESS')
    
    if (sessionError) {
      return NextResponse.redirect(
        new URL(`/auth?error=${sessionError.message}`, request.url)
      )
    }

    return NextResponse.redirect(new URL(next, request.url))
  }

  return NextResponse.redirect(new URL('/auth/confirm', request.url))
}
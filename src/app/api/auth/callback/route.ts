import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/auth/callback — Handle Supabase PKCE email confirmation
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error.message)
        // Redirect to login with error
        return NextResponse.redirect(
          `${origin}/?error=confirmation_failed`,
          302
        )
      }

      // Successfully exchanged code for session — redirect to app
      return NextResponse.redirect(`${origin}${next}`, 302)
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(
        `${origin}/?error=server_error`,
        302
      )
    }
  }

  // No code provided — redirect to root
  return NextResponse.redirect(`${origin}/`, 302)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail invalide'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Check if user exists (always return success to prevent email enumeration)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      // In production: send email with reset token
      // For now, just log it
      console.log(`Password reset requested for: ${user.email}`)
      
      // Store a verification token
      const token = Math.random().toString(36).substring(2, 15)
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      try {
        await db.verificationToken.create({
          data: {
            identifier: user.email,
            token,
            expires,
          },
        })
      } catch {
        // Token might already exist, that's okay
      }

      console.log(`Reset token for ${email}: ${token} (expires: ${expires})`)
    }

    return NextResponse.json({
      message: 'Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

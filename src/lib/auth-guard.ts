import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Result of authentication check with organization context.
 */
export interface AuthContext {
  supabase: SupabaseClient
  userId: string
  organizationId: string
  role: string
}

/**
 * Require an authenticated user with an active organization membership.
 * Returns the auth context or a NextResponse error.
 */
export async function requireAuthWithOrg(): Promise<
  | { ctx: AuthContext; error: null }
  | { ctx: null; error: NextResponse }
> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      ),
    }
  }

  // Get user profile with organization membership
  const { data: member, error: memberError } = await supabase
    .from(TABLES.ORGANIZATION_MEMBERS)
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .is('organizations.deleted_at', null)
    .single()

  if (memberError || !member) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: 'Aucune organisation associée à votre compte' },
        { status: 403 }
      ),
    }
  }

  return {
    ctx: {
      supabase,
      userId: user.id,
      organizationId: member.organization_id,
      role: member.role,
    },
    error: null,
  }
}

/**
 * Require the authenticated user to have one of the specified roles.
 */
export async function requireRole(
  allowedRoles: string[]
): Promise<
  | { ctx: AuthContext; error: null }
  | { ctx: null; error: NextResponse }
> {
  const result = await requireAuthWithOrg()

  if (result.error) return result

  if (!allowedRoles.includes(result.ctx.role)) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: 'Accès non autorisé. Rôle insuffisant.' },
        { status: 403 }
      ),
    }
  }

  return result
}

/**
 * Require super_admin role.
 */
export async function requireSuperAdmin(): Promise<
  | { ctx: AuthContext; error: null }
  | { ctx: null; error: NextResponse }
> {
  return requireRole(['super_admin'])
}

/**
 * Require owner or manager role.
 */
export async function requireOwnerOrManager(): Promise<
  | { ctx: AuthContext; error: null }
  | { ctx: null; error: NextResponse }
> {
  return requireRole(['owner', 'manager', 'super_admin'])
}

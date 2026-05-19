import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'

/**
 * POST /api/setup — Check database tables existence and return status
 *
 * This endpoint is used during initial setup to verify that
 * all required Supabase tables exist.
 */
export async function POST(_request: NextRequest) {
  try {
    const admin = createAdminClient()

    const requiredTables = [
      TABLES.PROFILES,
      TABLES.ORGANIZATIONS,
      TABLES.ORGANIZATION_MEMBERS,
      TABLES.HOTELS,
      TABLES.ROOM_TYPES,
      TABLES.ROOMS,
      TABLES.GUESTS,
      TABLES.RESERVATIONS,
      TABLES.PAYMENTS,
      TABLES.SUBSCRIPTION_PAYMENTS,
      TABLES.ACTIVITY_LOG,
    ]

    const results: Record<string, { exists: boolean; error?: string }> = {}

    // Check each table by attempting a simple select with limit 0
    await Promise.all(
      requiredTables.map(async (table) => {
        try {
          const { error } = await admin
            .from(table)
            .select('id', { count: 'exact', head: true })

          results[table] = {
            exists: !error || !error.message.includes('does not exist'),
          }
        } catch {
          results[table] = {
            exists: false,
            error: 'Erreur de connexion',
          }
        }
      })
    )

    const allExist = Object.values(results).every((r) => r.exists)
    const missing = Object.entries(results)
      .filter(([, r]) => !r.exists)
      .map(([table]) => table)

    return NextResponse.json({
      status: allExist ? 'ready' : 'incomplete',
      tables: results,
      missing: missing.length > 0 ? missing : undefined,
      message: allExist
        ? 'Toutes les tables sont prêtes'
        : `Tables manquantes : ${missing.join(', ')}`,
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Erreur serveur lors de la vérification des tables',
      },
      { status: 500 }
    )
  }
}

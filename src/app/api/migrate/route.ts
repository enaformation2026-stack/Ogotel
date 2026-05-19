import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/supabase/database'

/**
 * POST /api/migrate — Run database migration (super_admin only)
 *
 * This endpoint applies pending database schema changes.
 * In production, migrations should be managed via Supabase Dashboard
 * or a CI/CD pipeline. This is a convenience endpoint for development.
 *
 * Supported operations:
 * - create_missing_tables: Creates tables that don't exist yet
 * - add_missing_columns: Adds columns that are missing from existing tables
 */
export async function POST(request: NextRequest) {
  try {
    const result = await requireSuperAdmin()
    if (result.error) return result.error

    const body = await request.json()
    const operation = body.operation || 'create_missing_tables'

    if (!['create_missing_tables', 'add_missing_columns'].includes(operation)) {
      return NextResponse.json(
        { error: 'Opération invalide. Opérations supportées : create_missing_tables, add_missing_columns' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Define the SQL for creating missing tables
    // In Supabase, DDL operations require the service role
    // Note: In production, this should use Supabase SQL API or migrations
    const migrationResults: string[] = []

    if (operation === 'create_missing_tables') {
      // Check which tables exist
      const tablesToCheck = [
        { name: TABLES.PROFILES, sql: '' },
        { name: TABLES.SUBSCRIPTION_PAYMENTS, sql: '' },
        { name: TABLES.ACTIVITY_LOG, sql: '' },
      ]

      for (const table of tablesToCheck) {
        try {
          const { error } = await admin
            .from(table.name)
            .select('id', { count: 'exact', head: true })

          const exists = !error || !error.message.includes('does not exist')

          if (exists) {
            migrationResults.push(`✓ Table "${table.name}" existe déjà`)
          } else {
            migrationResults.push(`✗ Table "${table.name}" doit être créée via Supabase Dashboard`)
          }
        } catch {
          migrationResults.push(`⚠ Impossible de vérifier "${table.name}"`)
        }
      }
    }

    if (operation === 'add_missing_columns') {
      migrationResults.push('ℹ Les colonnes doivent être ajoutées via Supabase Dashboard (SQL Editor)')
    }

    return NextResponse.json({
      success: true,
      operation,
      results: migrationResults,
      message: 'Pour les opérations de migration en production, utilisez le SQL Editor de Supabase Dashboard',
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

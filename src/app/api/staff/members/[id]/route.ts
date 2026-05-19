import { NextRequest, NextResponse } from 'next/server'
import { requireOwnerOrManager } from '@/lib/auth-guard'
import { TABLES } from '@/lib/supabase/database'

// DELETE /api/staff/members/[id] — Remove a staff member from organization
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await requireOwnerOrManager()
    if (result.error) return result.error

    const { supabase, organizationId, userId: currentUserId } = result.ctx

    // Fetch the membership record
    const { data: membership, error: memberError } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'Membre introuvable' },
        { status: 404 }
      )
    }

    // Cannot remove yourself
    if (membership.user_id === currentUserId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous retirer vous-même de l\'organisation' },
        { status: 400 }
      )
    }

    // Cannot remove the owner
    if (membership.role === 'owner') {
      return NextResponse.json(
        { error: 'Le propriétaire de l\'organisation ne peut pas être retiré' },
        { status: 400 }
      )
    }

    // Soft remove (set is_active = false)
    const { error: updateError } = await supabase
      .from(TABLES.ORGANIZATION_MEMBERS)
      .update({ is_active: false })
      .eq('id', id)

    if (updateError) {
      console.error('Remove member error:', updateError.message)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du membre' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Membre retiré de l\'organisation',
    })
  } catch (error) {
    console.error('Staff member delete error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

// Invoice HTML Generator — OGOTEL CLOUD
// Generates professional A4 invoice HTML with inline CSS

import type { Payment, Reservation, Hotel, Guest } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvoiceData {
  payment: Payment
  reservation: Reservation
  hotel: Hotel
  guest: Guest
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    orange_money: 'Orange Money',
    mtn_money: 'MTN Money',
    wave: 'Wave',
    moov_money: 'Moov Money',
    card: 'Carte bancaire',
    bank_transfer: 'Virement bancaire',
  }
  return labels[method] ?? method
}

// ── Brand Color ───────────────────────────────────────────────────────────────

const BRAND_COLOR = '#1B4332'
const BRAND_COLOR_LIGHT = '#2D6A4F'
const TEXT_COLOR = '#1a1a1a'
const MUTED_COLOR = '#6b7280'
const BORDER_COLOR = '#e5e7eb'
const BG_COLOR = '#f9fafb'

// ── Main Function ─────────────────────────────────────────────────────────────

export function generateInvoiceHTML(data: InvoiceData): string {
  const { payment, reservation, hotel, guest } = data

  const invoiceNumber = payment.reference || `INV-${Date.now()}`
  const invoiceDate = formatDateTime(payment.paidAt ?? new Date().toISOString())
  const subtotal = (reservation.roomRate ?? 0) * (reservation.nights ?? 0)
  const taxAmount = reservation.taxAmount ?? 0
  const discountAmount = reservation.discountAmount ?? 0
  const totalAmount = reservation.totalAmount ?? payment.amount

  const hotelStars = hotel.stars ? '★'.repeat(hotel.stars) : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture ${invoiceNumber} — ${hotel.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      color: ${TEXT_COLOR};
      background: white;
      font-size: 11pt;
      line-height: 1.5;
    }
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 20mm 18mm;
    }

    /* Header */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${BRAND_COLOR};
    }
    .header-left { flex: 1; }
    .hotel-name {
      font-size: 22pt;
      font-weight: 700;
      color: ${BRAND_COLOR};
      margin-bottom: 4px;
    }
    .hotel-stars { color: #f59e0b; font-size: 12pt; margin-bottom: 6px; }
    .hotel-info { color: ${MUTED_COLOR}; font-size: 9pt; line-height: 1.6; }
    .header-right { text-align: right; }
    .invoice-title {
      font-size: 18pt;
      font-weight: 700;
      color: ${BRAND_COLOR};
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .invoice-meta { font-size: 9pt; color: ${MUTED_COLOR}; line-height: 1.8; }
    .invoice-meta strong { color: ${TEXT_COLOR}; }

    /* Client & Hotel Info */
    .parties {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
    }
    .party { flex: 1; }
    .party-label {
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${BRAND_COLOR};
      margin-bottom: 8px;
    }
    .party-name { font-size: 12pt; font-weight: 600; margin-bottom: 4px; }
    .party-details { font-size: 9pt; color: ${MUTED_COLOR}; line-height: 1.6; }

    /* Table */
    .table-section { margin-bottom: 30px; }
    .table-section h3 {
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${BRAND_COLOR};
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    thead th {
      background: ${BRAND_COLOR};
      color: white;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th:last-child,
    tbody td:last-child { text-align: right; }
    tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid ${BORDER_COLOR};
    }
    tbody tr:nth-child(even) { background: ${BG_COLOR}; }
    .description-cell { max-width: 240px; }
    .bold-cell { font-weight: 600; }

    /* Totals */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-table {
      width: 260px;
      font-size: 9.5pt;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
    }
    .totals-row.subtotal,
    .totals-row.tax,
    .totals-row.discount { color: ${MUTED_COLOR}; }
    .totals-row.discount .value { color: #dc2626; }
    .totals-row.total {
      border-top: 2px solid ${BRAND_COLOR};
      padding-top: 10px;
      margin-top: 4px;
      font-size: 12pt;
      font-weight: 700;
    }
    .totals-row.total .value { color: ${BRAND_COLOR}; }

    /* Payment Info */
    .payment-info {
      background: ${BG_COLOR};
      border: 1px solid ${BORDER_COLOR};
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 30px;
    }
    .payment-info h3 {
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${BRAND_COLOR};
      margin-bottom: 8px;
    }
    .payment-details { font-size: 9pt; color: ${MUTED_COLOR}; line-height: 1.8; }
    .payment-details strong { color: ${TEXT_COLOR}; }

    /* Footer */
    .footer {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid ${BORDER_COLOR};
      text-align: center;
      font-size: 8pt;
      color: ${MUTED_COLOR};
      line-height: 1.6;
    }
    .footer-brand { color: ${BRAND_COLOR}; font-weight: 600; font-size: 9pt; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="hotel-name">${hotel.name}</div>
        ${hotelStars ? `<div class="hotel-stars">${hotelStars}</div>` : ''}
        <div class="hotel-info">
          ${hotel.address ? `${hotel.address}<br/>` : ''}
          ${[hotel.city, hotel.district].filter(Boolean).join(', ') || ''}
          ${hotel.phone ? `<br/>Tél : ${hotel.phone}` : ''}
          ${hotel.email ? `<br/>${hotel.email}` : ''}
        </div>
      </div>
      <div class="header-right">
        <div class="invoice-title">Facture</div>
        <div class="invoice-meta">
          <strong>N°</strong> : ${invoiceNumber}<br/>
          <strong>Date</strong> : ${invoiceDate}<br/>
          <strong>Réf. réservation</strong> : ${reservation.reference || '—'}
        </div>
      </div>
    </div>

    <!-- Client & Hotel Info -->
    <div class="parties">
      <div class="party">
        <div class="party-label">Client</div>
        <div class="party-name">${guest.firstName} ${guest.lastName}</div>
        <div class="party-details">
          ${guest.phone ? `Tél : ${guest.phone}<br/>` : ''}
          ${guest.email ? `Email : ${guest.email}<br/>` : ''}
          ${guest.nationality ? `Nationalité : ${guest.nationality}<br/>` : ''}
          ${guest.city ? `${guest.city}, ${guest.country || ''}` : ''}
        </div>
      </div>
      <div class="party">
        <div class="party-label">Établissement</div>
        <div class="party-name">${hotel.name}</div>
        <div class="party-details">
          ${hotel.address || ''}
          ${hotel.city ? `<br/>${hotel.city}${hotel.district ? `, ${hotel.district}` : ''}` : ''}
          ${hotel.phone ? `<br/>Tél : ${hotel.phone}` : ''}
          ${hotel.email ? `<br/>${hotel.email}` : ''}
        </div>
      </div>
    </div>

    <!-- Stay Details Table -->
    <div class="table-section">
      <h3>Détails du séjour</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Dates</th>
            <th>Quantité</th>
            <th>Unitaire</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="description-cell bold-cell">
              Chambre ${reservation.room?.number || '—'}
              ${reservation.room?.roomType?.name ? `<br/><span style="font-weight:400;font-size:8.5pt;color:${MUTED_COLOR}">${reservation.room.roomType.name}</span>` : ''}
            </td>
            <td>
              ${formatDate(reservation.checkInDate)}<br/>
              <span style="color:${MUTED_COLOR};font-size:8.5pt">→ ${formatDate(reservation.checkOutDate)}</span>
            </td>
            <td>${reservation.nights || 0} nuit${(reservation.nights ?? 0) > 1 ? 's' : ''}</td>
            <td>${formatFCFA(reservation.roomRate || 0)}</td>
            <td>${formatFCFA(subtotal)}</td>
          </tr>
          ${discountAmount > 0 ? `
          <tr>
            <td colspan="4" style="color:#dc2626;font-style:italic">Remise</td>
            <td style="color:#dc2626">-${formatFCFA(discountAmount)}</td>
          </tr>` : ''}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-table">
        <div class="totals-row subtotal">
          <span class="label">Sous-total</span>
          <span class="value">${formatFCFA(subtotal)}</span>
        </div>
        <div class="totals-row tax">
          <span class="label">Taxe (${((reservation.taxAmount / (subtotal || 1)) * 100).toFixed(0)}%)</span>
          <span class="value">${formatFCFA(taxAmount)}</span>
        </div>
        ${discountAmount > 0 ? `
        <div class="totals-row discount">
          <span class="label">Remise</span>
          <span class="value">-${formatFCFA(discountAmount)}</span>
        </div>` : ''}
        <div class="totals-row total">
          <span class="label">Total TTC</span>
          <span class="value">${formatFCFA(totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <h3>Informations de paiement</h3>
      <div class="payment-details">
        <strong>Méthode</strong> : ${getPaymentMethodLabel(payment.method)}<br/>
        <strong>Montant payé</strong> : ${formatFCFA(payment.amount)}<br/>
        <strong>Statut</strong> : ${payment.status === 'completed' ? '✓ Payé' : payment.status === 'partial' ? '⟳ Partiel' : payment.status}<br/>
        ${payment.mobileNumber ? `<strong>N° mobile</strong> : ${payment.mobileNumber}` : ''}
        ${payment.operatorRef ? `<br/><strong>Réf. opérateur</strong> : ${payment.operatorRef}` : ''}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">OGOTEL CLOUD — Système de Gestion Hôtelière</div>
      <div>
        Facture générée automatiquement le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <div style="margin-top:4px">
        ${hotel.name} · ${[hotel.city, hotel.district].filter(Boolean).join(', ') || 'Côte d\'Ivoire'}
        ${hotel.phone ? ` · ${hotel.phone}` : ''}
      </div>
    </div>

  </div>
</body>
</html>`
}

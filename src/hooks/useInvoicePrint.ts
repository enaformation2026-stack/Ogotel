'use client'

import { useCallback } from 'react'
import { generateInvoiceHTML } from '@/lib/invoice'
import type { Payment, Reservation, Hotel, Guest } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvoiceInput {
  payment: Payment
  reservation: Reservation
  hotel: Hotel
  guest: Guest
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useInvoicePrint() {
  const printInvoice = useCallback((data: InvoiceInput) => {
    try {
      // Generate the HTML
      const html = generateInvoiceHTML(data)

      // Open a new window
      const printWindow = window.open('', '_blank', 'width=800,height=1100')

      if (!printWindow) {
        // Fallback: try without dimensions
        const fallbackWindow = window.open('')
        if (!fallbackWindow) {
          throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups sont autorisées.')
        }
        writeAndPrint(fallbackWindow, html)
        return
      }

      writeAndPrint(printWindow, html)
    } catch (error: any) {
      console.error('Invoice print error:', error)
      throw error
    }
  }, [])

  const downloadInvoice = useCallback((data: InvoiceInput, filename?: string) => {
    try {
      const html = generateInvoiceHTML(data)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename || `facture-${data.payment.reference || 'invoice'}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error: any) {
      console.error('Invoice download error:', error)
      throw error
    }
  }, [])

  return { printInvoice, downloadInvoice }
}

// ── Internal Helper ───────────────────────────────────────────────────────────

function writeAndPrint(win: Window, html: string) {
  win.document.write(html)
  win.document.close()

  // Wait for content to render, then print
  win.onload = () => {
    setTimeout(() => {
      win.print()
    }, 300)
  }

  // Fallback in case onload doesn't fire
  setTimeout(() => {
    win.print()
  }, 1000)
}

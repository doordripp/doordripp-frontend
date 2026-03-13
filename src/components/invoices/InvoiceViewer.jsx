import React, { useRef } from 'react'
import InvoiceTemplate from './InvoiceTemplate'

/**
 * Invoice Viewer Component
 * Display and manage invoice printing/PDF export
 */
export default function InvoiceViewer({ invoiceData }) {
  const invoiceRef = useRef(null)

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=1200')
    if (invoiceRef.current) {
      const invoiceHTML = invoiceRef.current.innerHTML
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice</title>
            <style>
              ${getCSSStyles()}
            </style>
          </head>
          <body>
            ${invoiceHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // Check if html2pdf library is available
      if (typeof window.html2pdf === 'undefined') {
        console.warn('html2pdf library not available. Please install it via CDN or npm.')
        alert('PDF generation requires html2pdf library. Using browser print instead.')
        handlePrint()
        return
      }

      const element = invoiceRef.current
      const opt = {
        margin: 5,
        filename: `invoice-${invoiceData?.invoiceNumber || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      window.html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const getCSSStyles = () => {
    // Extract CSS from imported stylesheet
    // This is a simplified version - in production, you'd import the actual CSS
    return `
      :root {
        --primary-color: #1f2937;
        --secondary-color: #0066cc;
        --accent-color: #ff9800;
        --border-color: #e5e7eb;
        --text-primary: #1f2937;
        --text-secondary: #6b7280;
        --success-color: #10b981;
        --light-bg: #f9fafb;
        --white: #ffffff;
      }

      * { box-sizing: border-box; }
      
      body {
        margin: 0;
        padding: 20px;
        background: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      }

      .invoice-container {
        max-width: 900px;
        margin: 0 auto;
        background-color: var(--white);
        color: var(--text-primary);
        line-height: 1.5;
      }

      /* Include all CSS here or import the actual stylesheet */
    `
  }

  return (
    <div className="invoice-viewer-wrapper">
      {/* Toolbar */}
      <div className="invoice-toolbar no-print" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handlePrint}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '13px'
          }}
        >
          🖨️ Print Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '13px'
          }}
        >
          📥 Download PDF
        </button>
      </div>

      {/* Invoice */}
      <div ref={invoiceRef} style={{ backgroundColor: 'white' }}>
        <InvoiceTemplate invoiceData={invoiceData} forPrint={true} />
      </div>
    </div>
  )
}

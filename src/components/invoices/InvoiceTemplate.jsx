import React from 'react'
import './InvoiceTemplate.css'

/**
 * Professional GST Invoice Template for DoorDripp
 * Suitable for PDF export and printing
 * 
 * Props:
 * - invoiceData: Object containing invoice details
 * - forPrint: Boolean to control print-specific styling
 */
export default function InvoiceTemplate({ invoiceData = {}, forPrint = false }) {
  // Default sample data for demonstration
  const defaultData = {
    invoiceNumber: 'INV-2026-00001',
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    orderId: 'ORD-2026-00001',
    poDate: new Date().toLocaleDateString('en-IN'),
    
    // Customer details
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh@example.com',
    customerPhone: '+91-9876543210',
    
    // Billing address
    billingAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      stateCode: '29'
    },
    
    // Shipping address
    shippingAddress: {
      street: '456 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560025',
      country: 'India'
    },
    
    // Order items
    items: [
      {
        sno: 1,
        name: 'Classic Solid T-Shirt',
        description: 'Premium Cotton Blend',
        hsnCode: '6104',
        quantity: 2,
        unitPrice: 799,
        taxableAmount: 1598,
        gstPercent: 5,
        cgst: 79.90,
        sgst: 79.90,
        totalAmount: 1757.80
      },
      {
        sno: 2,
        name: 'Slim Fit Denim Jeans',
        description: 'Blue Wash, Size 32',
        hsnCode: '6203',
        quantity: 1,
        unitPrice: 1799,
        taxableAmount: 1799,
        gstPercent: 5,
        cgst: 89.95,
        sgst: 89.95,
        totalAmount: 1978.90
      }
    ],
    
    // Payment details
    paymentMode: 'UPI',
    transactionId: 'TXN20260205001',
    paymentStatus: 'Success',
    
    // Company details (hardcoded)
    company: {
      name: 'DoorDripp Pvt Ltd',
      gstin: '09AAMCD3799E1Z5',
      pan: 'AAMCD3799E',
      address: 'LandCraft Metro Homes, Muradnagar, Ghaziabad, Uttar Pradesh – 201206',
      phone: '+91-9286819663',
      email: 'support@doordripp.com',
      website: 'www.doordripp.com'
    }
  }
  
  const data = { ...defaultData, ...invoiceData }
  
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalGst = data.items.reduce((sum, item) => sum + (item.cgst || 0) + (item.sgst || 0), 0)
  const grandTotal = subtotal + totalGst
  
  // Convert amount to words (Indian format)
  const amountInWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    let numStr = Math.floor(amount).toString().padStart(9, '0')
    let crore = numStr.substring(0, 1)
    let lakh = numStr.substring(1, 3)
    let thousand = numStr.substring(3, 5)
    let hundred = numStr.substring(5, 7)
    let ones_tens = numStr.substring(7, 9)
    
    let result = ''
    
    if (crore !== '0') {
      result += ones[crore] + ' Crore '
    }
    
    if (lakh !== '00') {
      let l = parseInt(lakh)
      if (l >= 20) {
        result += tens[Math.floor(l / 10)] + ' '
        if (l % 10 !== 0) result += ones[l % 10] + ' '
      } else if (l >= 10) {
        result += teens[l - 10] + ' '
      } else if (l > 0) {
        result += ones[l] + ' '
      }
      result += 'Lakh '
    }
    
    if (thousand !== '00') {
      let t = parseInt(thousand)
      if (t >= 20) {
        result += tens[Math.floor(t / 10)] + ' '
        if (t % 10 !== 0) result += ones[t % 10] + ' '
      } else if (t >= 10) {
        result += teens[t - 10] + ' '
      } else if (t > 0) {
        result += ones[t] + ' '
      }
      result += 'Thousand '
    }
    
    if (hundred !== '00') {
      let h = parseInt(hundred)
      result += ones[h] + ' Hundred '
    }
    
    if (ones_tens !== '00') {
      let ot = parseInt(ones_tens)
      if (ot >= 20) {
        result += tens[Math.floor(ot / 10)] + ' '
        if (ot % 10 !== 0) result += ones[ot % 10] + ' '
      } else if (ot >= 10) {
        result += teens[ot - 10] + ' '
      } else if (ot > 0) {
        result += ones[ot] + ' '
      }
    }
    
    return result.trim() + ' Rupees Only'
  }
  
  return (
    <div className={`invoice-container ${forPrint ? 'invoice-print' : ''}`}>
      {/* Header Section */}
      <div className="invoice-header">
        <div className="header-left">
          <div className="company-logo-placeholder">📦</div>
          <div>
            <h1 className="company-name">{data.company.name}</h1>
            <p className="company-tagline">Fast Fashion, Fresh Every Day</p>
          </div>
        </div>
        <div className="header-right">
          <div className="invoice-badge">TAX INVOICE</div>
          <div className="invoice-meta">
            <p><strong>Invoice No:</strong> {data.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> {data.invoiceDate}</p>
            <p><strong>Order ID:</strong> {data.orderId}</p>
          </div>
        </div>
      </div>

      {/* Company Details Section */}
      <div className="company-details-bar">
        <div className="detail-item">
          <span className="label">GSTIN:</span>
          <span className="value">{data.company.gstin}</span>
        </div>
        <div className="detail-item">
          <span className="label">PAN:</span>
          <span className="value">{data.company.pan}</span>
        </div>
        <div className="detail-item">
          <span className="label">Email:</span>
          <span className="value">{data.company.email}</span>
        </div>
        <div className="detail-item">
          <span className="label">Phone:</span>
          <span className="value">{data.company.phone}</span>
        </div>
      </div>

      {/* Address Section */}
      <div className="address-section">
        <div className="address-block">
          <h3 className="address-title">🏢 BILLED FROM (Seller)</h3>
          <div className="address-content">
            <p className="company-address">{data.company.name}</p>
            <p>{data.company.address}</p>
            <p>
              <strong>GSTIN:</strong> {data.company.gstin} | 
              <strong> State Code:</strong> 09
            </p>
          </div>
        </div>

        <div className="address-block">
          <h3 className="address-title">👤 BILLED TO (Customer)</h3>
          <div className="address-content">
            <p className="customer-name">{data.customerName}</p>
            <p>{data.billingAddress.street}</p>
            <p>
              {data.billingAddress.city}, {data.billingAddress.state} {data.billingAddress.pincode}
            </p>
            <p>{data.billingAddress.country}</p>
            <p>
              <strong>Email:</strong> {data.customerEmail} | 
              <strong> Phone:</strong> {data.customerPhone}
            </p>
          </div>
        </div>

        <div className="address-block">
          <h3 className="address-title">🚚 SHIPPED TO</h3>
          <div className="address-content">
            <p className="customer-name">{data.customerName}</p>
            <p>{data.shippingAddress.street}</p>
            <p>
              {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.pincode}
            </p>
            <p>{data.shippingAddress.country}</p>
            <p>
              <strong>Place of Supply:</strong> {data.billingAddress.state} (Code: {data.billingAddress.stateCode})
            </p>
          </div>
        </div>
      </div>

      {/* Items Table Section */}
      <div className="items-section">
        <table className="items-table">
          <thead>
            <tr className="table-header">
              <th className="col-sno">S.No</th>
              <th className="col-product">Product Description</th>
              <th className="col-hsn">HSN Code</th>
              <th className="col-qty">Qty</th>
              <th className="col-price">Unit Price</th>
              <th className="col-taxable">Taxable Amount</th>
              <th className="col-gst">GST %</th>
              <th className="col-total">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} className="table-row">
                <td className="col-sno">{item.sno}</td>
                <td className="col-product">
                  <div className="product-name">{item.name}</div>
                  <div className="product-desc">{item.description}</div>
                </td>
                <td className="col-hsn">{item.hsnCode}</td>
                <td className="col-qty">{item.quantity}</td>
                <td className="col-price">₹{item.unitPrice.toFixed(2)}</td>
                <td className="col-taxable">₹{item.taxableAmount.toFixed(2)}</td>
                <td className="col-gst">{item.gstPercent}%</td>
                <td className="col-total">₹{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST Breakdown Table */}
        <table className="gst-breakdown-table">
          <thead>
            <tr className="table-header">
              <th>HSN Code</th>
              <th>Qty</th>
              <th>Taxable Value</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>Total GST</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.hsnCode}</td>
                <td>{item.quantity}</td>
                <td>₹{item.taxableAmount.toFixed(2)}</td>
                <td>₹{(item.cgst || 0).toFixed(2)}</td>
                <td>₹{(item.sgst || 0).toFixed(2)}</td>
                <td>₹{((item.cgst || 0) + (item.sgst || 0)).toFixed(2)}</td>
                <td>₹{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-left">
          <div className="payment-details">
            <h4>PAYMENT DETAILS</h4>
            <p><strong>Mode:</strong> {data.paymentMode}</p>
            <p><strong>Transaction ID:</strong> {data.transactionId}</p>
            <p><strong>Status:</strong> <span className="badge-success">{data.paymentStatus}</span></p>
          </div>

          <div className="amount-in-words">
            <h4>AMOUNT IN WORDS</h4>
            <p className="amount-text">{amountInWords(grandTotal)}</p>
          </div>
        </div>

        <div className="summary-right">
          <div className="summary-table">
            <div className="summary-row">
              <span className="summary-label">Subtotal (Taxable Value):</span>
              <span className="summary-value">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">CGST (GST @ component):</span>
              <span className="summary-value">₹{(totalGst / 2).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">SGST (GST @ component):</span>
              <span className="summary-value">₹{(totalGst / 2).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total GST:</span>
              <span className="summary-value">₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="summary-row grand-total">
              <span className="summary-label">GRAND TOTAL:</span>
              <span className="summary-value">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="invoice-footer">
        <div className="footer-left">
          <div className="declaration">
            <p><strong>Declaration:</strong></p>
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p className="return-policy">
              <strong>Return Policy:</strong> 7 days return/exchange. Please contact support within 24 hours of receipt if there's any issue.
            </p>
          </div>
        </div>

        <div className="footer-right">
          <div className="authorized-by">
            <p style={{ marginTop: '30px' }}>_____________________</p>
            <p>Authorized Signatory</p>
            <p className="company-name-footer">{data.company.name}</p>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <h4>Need Help?</h4>
        <p>📧 Email: <strong>{data.company.email}</strong></p>
        <p>📞 Phone: <strong>{data.company.phone}</strong></p>
        <p>🌐 Website: <strong>{data.company.website}</strong></p>
        <p className="thank-you-message">
          Thank you for shopping with DoorDripp! We appreciate your business and look forward to serving you again.
        </p>
      </div>

      {/* Print Footer */}
      <div className="print-footer">
        <p>Generated on {new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  )
}

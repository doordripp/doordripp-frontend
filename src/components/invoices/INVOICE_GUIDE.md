# DoorDripp GST Invoice Template - Implementation Guide

## Overview
Professional, Amazon-style GST invoice template for DoorDripp ecommerce platform. Fully responsive, print-friendly, and PDF export ready.

---

## 📁 File Structure

```
src/components/invoices/
├── InvoiceTemplate.jsx      # Main invoice component
├── InvoiceTemplate.css      # Professional styling
├── InvoiceViewer.jsx        # Display & export wrapper
└── invoice-utils.js         # Utility functions (optional)
```

---

## 🚀 Quick Start

### Installation

1. **Copy files to your project:**
   ```
   src/components/invoices/
   ├── InvoiceTemplate.jsx
   ├── InvoiceTemplate.css
   └── InvoiceViewer.jsx
   ```

2. **For PDF export, add html2pdf to your HTML:**
   ```html
   <!-- In index.html -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
   ```

   OR install via npm:
   ```bash
   npm install html2pdf.js
   ```

### Basic Usage

```jsx
import InvoiceTemplate from './components/invoices/InvoiceTemplate'
import InvoiceViewer from './components/invoices/InvoiceViewer'

export default function MyPage() {
  const invoiceData = {
    invoiceNumber: 'INV-2026-00001',
    invoiceDate: '2026-02-05',
    orderId: 'ORD-2026-00001',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh@example.com',
    customerPhone: '+91-9876543210',
    billingAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      stateCode: '29'
    },
    shippingAddress: {
      street: '456 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560025',
      country: 'India'
    },
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
      }
    ],
    paymentMode: 'UPI',
    transactionId: 'TXN20260205001',
    paymentStatus: 'Success'
  }

  return <InvoiceViewer invoiceData={invoiceData} />
}
```

---

## 📋 Invoice Data Structure

```javascript
{
  // Invoice Metadata
  invoiceNumber: 'INV-2026-00001',           // Unique invoice ID
  invoiceDate: '2026-02-05',                 // Invoice generation date
  orderId: 'ORD-2026-00001',                 // Order reference
  poDate: '2026-02-05',                      // PO date (optional)

  // Customer Information
  customerName: 'Rajesh Kumar',
  customerEmail: 'rajesh@example.com',
  customerPhone: '+91-9876543210',

  // Billing Address
  billingAddress: {
    street: '123 MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    stateCode: '29'                          // GST State Code
  },

  // Shipping Address
  shippingAddress: {
    street: '456 Brigade Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560025',
    country: 'India'
  },

  // Line Items
  items: [
    {
      sno: 1,                                // Serial number
      name: 'Classic Solid T-Shirt',         // Product name
      description: 'Premium Cotton Blend',   // Product details
      hsnCode: '6104',                       // HSN/SAC code
      quantity: 2,                           // Quantity
      unitPrice: 799,                        // Price per unit
      taxableAmount: 1598,                   // Quantity × Unit Price
      gstPercent: 5,                         // GST percentage
      cgst: 79.90,                           // Central GST amount
      sgst: 79.90,                           // State GST amount
      totalAmount: 1757.80                   // Total with GST
    }
  ],

  // Payment Details
  paymentMode: 'UPI',                        // Payment method
  transactionId: 'TXN20260205001',           // Transaction reference
  paymentStatus: 'Success'                   // Payment status
}
```

---

## 🎨 Features Included

### ✅ Complete GST Compliance
- GST/HSN code fields
- CGST/SGST breakdown
- GST amount calculation
- Place of supply state codes
- Taxable vs total amount separation

### ✅ Professional Design
- Amazon/Flipkart style layout
- Clean, modern aesthetic
- Blue and gray color scheme
- Professional typography
- Proper spacing and alignment

### ✅ Functional Elements
- Company logo placeholder
- Invoice badge (TAX INVOICE)
- Address formatting
- Product description
- Payment status badges
- Amount in words (Indian format)
- Authorized signatory section
- Return policy notice
- Thank you message

### ✅ Output Options
- **Print:** Full print functionality
- **PDF:** Export to PDF (requires html2pdf)
- **Display:** Responsive web display
- **Mobile:** Mobile-optimized layout

### ✅ Responsive Design
- Desktop (900px+)
- Tablet (768px - 899px)
- Mobile (480px - 767px)
- Ultra-mobile (<480px)

---

## 🔧 Customization Guide

### Change Company Details

Edit the `company` object in `InvoiceTemplate.jsx`:

```jsx
company: {
  name: 'Your Company Name',
  gstin: 'YOUR_GSTIN',
  pan: 'YOUR_PAN',
  address: 'Your Address',
  phone: '+91-XXXXXXXXXX',
  email: 'your@email.com',
  website: 'www.yourwebsite.com'
}
```

### Change Colors

Update CSS variables in `InvoiceTemplate.css`:

```css
:root {
  --primary-color: #1f2937;      /* Dark gray */
  --secondary-color: #0066cc;    /* Blue */
  --accent-color: #ff9800;       /* Orange */
  --success-color: #10b981;      /* Green */
}
```

### Add Company Logo

Replace the emoji placeholder in the header:

```jsx
// In InvoiceTemplate.jsx
<img 
  src="/path/to/logo.png" 
  alt="Company Logo"
  className="company-logo"
  style={{ width: '60px', height: '60px' }}
/>
```

### Modify Styling

Edit `InvoiceTemplate.css` for any layout changes. Key sections:
- `.invoice-header` - Top section
- `.address-section` - Address blocks
- `.items-table` - Product table
- `.summary-section` - Totals section
- `.invoice-footer` - Footer area

---

## 📊 HSN/SAC Codes for Common Products

| Product Category | HSN Code | GST Rate |
|------------------|----------|----------|
| T-Shirts | 6104 | 5% |
| Shirts | 6105 | 5% |
| Jeans/Trousers | 6203 | 5% |
| Shorts | 6205 | 5% |
| Jackets | 6202 | 5% |
| Dresses | 6204 | 5% |
| Undergarments | 6108 | 5% |
| Socks | 6115 | 5% |
| Caps/Hats | 6506 | 5% |

---

## 🖨️ Printing & PDF Export

### Browser Print
```jsx
const invoiceRef = useRef()

const handlePrint = () => {
  const printWindow = window.open('', '', 'width=900,height=1200')
  printWindow.document.write(invoiceRef.current.innerHTML)
  printWindow.print()
}
```

### PDF Export (requires html2pdf)
```jsx
const handleDownloadPDF = () => {
  const element = invoiceRef.current
  const opt = {
    margin: 5,
    filename: 'invoice-123.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  window.html2pdf().set(opt).from(element).save()
}
```

---

## 🔐 Security Considerations

1. **Do not expose sensitive data** in frontend
2. **Validate all data** on backend before generating invoice
3. **Use HTTPS** when transmitting invoice data
4. **Hash invoice numbers** to prevent sequencing attacks
5. **Log all invoice generations** for audit trail
6. **Implement access controls** to restrict invoice viewing

---

## 📱 Mobile Optimization

The template is fully responsive and includes:
- Grid layout that adapts to screen size
- Font size adjustments for smaller screens
- Touch-friendly button sizes
- Simplified table layout on mobile
- Optimized spacing for readability

Test on:
- Mobile (iPhone, Android)
- Tablet (iPad, Android tablets)
- Desktop (1920px+, 1366px, 1024px)

---

## 🐛 Troubleshooting

### PDF Export Not Working
- Install html2pdf: `npm install html2pdf.js`
- Add CDN script to `index.html`
- Check browser console for errors

### Styling Issues
- Clear browser cache
- Check CSS file is imported correctly
- Verify no conflicting global styles

### Print Layout Broken
- Test in actual print preview (Ctrl+P)
- Check printer settings (margins, scaling)
- Verify all CSS is included in print

### Data Not Displaying
- Verify invoiceData prop structure
- Check console for validation errors
- Use provided sample data to test

---

## 📈 Performance Tips

1. **Lazy load PDF library:**
   ```jsx
   const loadHtml2pdf = () => {
     return import('html2pdf.js')
   }
   ```

2. **Memoize component:**
   ```jsx
   export default React.memo(InvoiceTemplate)
   ```

3. **Optimize images:**
   - Use PNG/WEBP format
   - Compress logo before use
   - Use reasonable dimensions

4. **Print optimization:**
   - Hide unnecessary elements in print
   - Use print-specific CSS
   - Test print performance

---

## 📝 Integration Example (Complete)

```jsx
import React, { useState } from 'react'
import InvoiceViewer from './components/invoices/InvoiceViewer'

export default function OrderConfirmation({ orderId }) {
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch order and generate invoice data
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const order = await response.json()

        // Transform order data to invoice format
        const invoice = {
          invoiceNumber: `INV-${order._id.slice(-6).toUpperCase()}`,
          invoiceDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
          orderId: order._id,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone,
          billingAddress: order.billingAddress,
          shippingAddress: order.shippingAddress,
          items: order.items.map((item, idx) => ({
            sno: idx + 1,
            name: item.name,
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: item.quantity,
            unitPrice: item.price,
            taxableAmount: item.price * item.quantity,
            gstPercent: item.gstPercent || 5,
            cgst: (item.price * item.quantity * (item.gstPercent || 5)) / 200,
            sgst: (item.price * item.quantity * (item.gstPercent || 5)) / 200,
            totalAmount: item.price * item.quantity * (1 + (item.gstPercent || 5) / 100)
          })),
          paymentMode: order.paymentMode,
          transactionId: order.transactionId,
          paymentStatus: order.paymentStatus
        }

        setInvoiceData(invoice)
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) return <div>Loading invoice...</div>
  if (!invoiceData) return <div>Invoice not found</div>

  return <InvoiceViewer invoiceData={invoiceData} />
}
```

---

## 📞 Support & Contact

For DoorDripp invoices:
- **Email:** support@doordripp.com
- **Phone:** +91-9286819663
- **Website:** www.doordripp.com

---

## 📄 License

This invoice template is part of the DoorDripp ecommerce platform and is proprietary.

---

## ✨ Changelog

### v1.0.0 - Initial Release
- ✅ Complete GST invoice template
- ✅ Amazon/Flipkart style design
- ✅ Responsive layout
- ✅ Print & PDF export
- ✅ HSN code support
- ✅ Professional styling
- ✅ Amount in words (Indian format)

---

Created: February 5, 2026
Last Updated: February 5, 2026

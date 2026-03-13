# 📄 DoorDripp GST Invoice System

A professional, production-ready GST tax invoice template for DoorDripp ecommerce platform. Designed with Amazon/Flipkart-style aesthetics, fully GST-compliant for India, and ready for print & PDF export.

---

## 🎯 Features

### ✅ Complete GST Compliance
- **HSN/SAC Codes** - Product classification
- **CGST/SGST Breakdown** - Central and State GST
- **GST Amounts** - Accurate calculations
- **Place of Supply** - State-wise tracking
- **Taxable vs Total** - Clear amount separation
- **Declaration** - Computer-generated invoice notice

### ✅ Professional Design
- **Amazon-Style Layout** - Modern, clean interface
- **Responsive Design** - Works on all devices
- **Print Optimized** - Perfect for A4 printing
- **PDF Ready** - Direct PDF export
- **Blue/Gray Theme** - Professional color scheme
- **Proper Typography** - Clean, readable fonts

### ✅ Complete Functionality
- **Invoice Header** - Number, date, order ID
- **Address Section** - Seller, buyer, shipping
- **Product Table** - Items with HSN codes
- **GST Breakdown** - Detailed tax summary
- **Payment Details** - Mode, transaction ID, status
- **Amount in Words** - Indian rupees format
- **Footer** - Authorized signatory, return policy

### ✅ Export Options
- **Print** - Browser print preview
- **PDF** - Download as PDF file
- **Display** - Web view
- **Email** - Ready for email attachment

---

## 📦 What's Included

```
src/components/invoices/
├── InvoiceTemplate.jsx          # Main React component
├── InvoiceTemplate.css          # Complete styling
├── InvoiceViewer.jsx            # Display & export wrapper
├── invoice-utils.js             # Helper functions
├── invoice-examples.jsx         # Usage examples
├── INVOICE_GUIDE.md             # Detailed guide
└── README.md                    # This file
```

---

## 🚀 Quick Start

### 1. Copy Files
Copy the invoice components to your project:
```
src/components/invoices/
```

### 2. Add HTML2PDF (Optional)
For PDF export, add to `index.html`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

Or install via npm:
```bash
npm install html2pdf.js
```

### 3. Basic Usage
```jsx
import InvoiceViewer from './components/invoices/InvoiceViewer'

export default function OrderPage({ orderId }) {
  const invoiceData = {
    invoiceNumber: 'INV-2026-00001',
    invoiceDate: '2026-02-05',
    orderId: 'ORD-2026-00001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+91-9876543210',
    billingAddress: {
      street: '123 Main Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      stateCode: '29'
    },
    shippingAddress: {
      street: '456 Oak Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560025',
      country: 'India'
    },
    items: [
      {
        sno: 1,
        name: 'T-Shirt',
        description: 'Premium Cotton',
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
  invoiceNumber: string,        // e.g., 'INV-2026-00001'
  invoiceDate: string,          // e.g., '2026-02-05'
  orderId: string,              // Order reference
  poDate: string,               // Optional PO date

  // Customer Details
  customerName: string,
  customerEmail: string,
  customerPhone: string,

  // Billing Address
  billingAddress: {
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
    stateCode: string             // GST state code
  },

  // Shipping Address
  shippingAddress: {
    street: string,
    city: string,
    state: string,
    pincode: string,
    country: string
  },

  // Line Items
  items: [
    {
      sno: number,               // Serial number
      name: string,              // Product name
      description: string,       // Product details
      hsnCode: string,           // HSN/SAC code
      quantity: number,
      unitPrice: number,
      taxableAmount: number,     // qty × price
      gstPercent: number,        // GST rate %
      cgst: number,              // Central GST
      sgst: number,              // State GST
      totalAmount: number        // Total with GST
    }
  ],

  // Payment Details
  paymentMode: string,           // e.g., 'UPI', 'Card'
  transactionId: string,
  paymentStatus: string          // e.g., 'Success'
}
```

---

## 🛠️ Utility Functions

The `invoice-utils.js` file provides helper functions:

### Calculations
```javascript
import { 
  calculateGST, 
  calculateItemTotal,
  calculateInvoiceTotals,
  amountToWords 
} from './invoice-utils'

// Calculate GST
const { gstAmount, cgst, sgst } = calculateGST(1000, 5)

// Convert amount to words
const words = amountToWords(5432.50)
// Output: "Five Thousand Four Hundred Thirty Two Rupees and Fifty Paise Only"
```

### Data Transformation
```javascript
import { transformOrderToInvoice } from './invoice-utils'

// Convert API order to invoice format
const invoice = transformOrderToInvoice(orderData)
```

### Validation
```javascript
import { validateInvoiceData } from './invoice-utils'

// Validate invoice data
const { isValid, errors } = validateInvoiceData(invoiceData)
```

### HSN & State Codes
```javascript
import { getHSNCode, getStateCode } from './invoice-utils'

// Get HSN code for product
const { code, rate } = getHSNCode('t-shirt')  // Returns { code: '6104', rate: 5 }

// Get state code
const code = getStateCode('Karnataka')  // Returns '29'
```

---

## 🎨 Customization

### Change Company Details
Edit the company object in `InvoiceTemplate.jsx`:

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
Replace the emoji placeholder:

```jsx
<img 
  src="/path/to/logo.png" 
  alt="Logo"
  style={{ width: '60px', height: '60px' }}
/>
```

---

## 📊 HSN Codes Reference

| Category | HSN Code | GST Rate |
|----------|----------|----------|
| T-Shirts | 6104 | 5% |
| Shirts | 6105 | 5% |
| Jeans | 6203 | 5% |
| Trousers | 6203 | 5% |
| Shorts | 6205 | 5% |
| Jackets | 6202 | 5% |
| Dresses | 6204 | 5% |
| Undergarments | 6108 | 5% |
| Socks | 6115 | 5% |
| Caps/Hats | 6506 | 5% |

---

## 🖨️ Printing & PDF

### Print Invoice
```jsx
const handlePrint = () => {
  window.print()
}
```

### Download as PDF
```jsx
const handleDownloadPDF = async () => {
  const element = invoiceRef.current
  const opt = {
    filename: 'invoice.pdf',
    jsPDF: { format: 'a4' }
  }
  window.html2pdf().set(opt).from(element).save()
}
```

---

## 📱 Responsive Breakpoints

- **Desktop:** 900px and above
- **Tablet:** 768px - 899px
- **Mobile:** 480px - 767px
- **Small Mobile:** Below 480px

---

## 🔐 Security Best Practices

1. ✅ **Don't expose sensitive data** in frontend code
2. ✅ **Validate all data** on backend before generating invoices
3. ✅ **Use HTTPS** for invoice transmission
4. ✅ **Implement access controls** for invoice viewing
5. ✅ **Log all invoice generations** for audit trail
6. ✅ **Hash invoice numbers** to prevent guessing

---

## 📦 Integration Examples

### Example 1: Simple Invoice
See `invoice-examples.jsx` - `SimpleInvoiceExample()`

### Example 2: From API Order
See `invoice-examples.jsx` - `APIOrderInvoiceExample()`

### Example 3: With Custom Calculations
See `invoice-examples.jsx` - `CustomCalculationInvoiceExample()`

### Example 4: Multiple GST Rates
See `invoice-examples.jsx` - `MultipleGSTRatesExample()`

### Example 5: Inter-State Sale
See `invoice-examples.jsx` - `InterStateInvoiceExample()`

---

## 🐛 Troubleshooting

### PDF Not Generating
- Check if html2pdf is loaded
- Verify CDN link is correct
- Check browser console for errors
- Try using browser print to PDF

### Print Layout Broken
- Check printer margins
- Verify CSS is complete
- Test in print preview
- Check for missing images

### Data Not Showing
- Validate invoice data structure
- Check console for errors
- Verify all required fields present
- Use sample data to test

### Styling Issues
- Clear browser cache
- Check CSS file imported
- Look for conflicting styles
- Test in incognito mode

---

## 📈 Performance Tips

1. **Lazy load PDF library** for faster page load
2. **Memoize component** to prevent unnecessary re-renders
3. **Compress images** before using in invoices
4. **Use print media queries** for print optimization

---

## 📞 Support

For DoorDripp invoices:
- **Email:** support@doordripp.com
- **Phone:** +91-9286819663
- **Website:** www.doordripp.com

---

## 📄 Company Information

**DoorDripp Pvt Ltd**
- **GSTIN:** 09AAMCD3799E1Z5
- **PAN:** AAMCD3799E
- **Address:** LandCraft Metro Homes, Muradnagar, Ghaziabad, Uttar Pradesh – 201206
- **Phone:** +91-9286819663
- **Email:** support@doordripp.com
- **Website:** www.doordripp.com

---

## 📜 Compliance

✅ **GST Compliant** - All Indian GST requirements met
✅ **FSSAI Ready** - Format suitable for food businesses
✅ **E-Commerce Ready** - Built for online orders
✅ **Audit Ready** - Complete transaction tracking
✅ **Legally Valid** - Computer-generated declaration included

---

## 📝 Changelog

### v1.0.0 (February 5, 2026)
- ✅ Initial release
- ✅ Complete GST invoice template
- ✅ Amazon-style design
- ✅ Responsive layout
- ✅ Print & PDF support
- ✅ HSN code support
- ✅ Amount in words
- ✅ Utility functions
- ✅ Complete documentation

---

## 📄 License

This invoice template is part of the DoorDripp ecommerce platform.

---

**Created:** February 5, 2026  
**Status:** Production Ready ✅  
**Version:** 1.0.0

/**
 * Invoice Template - Usage Examples
 * Complete working examples for different use cases
 */

import InvoiceTemplate from './InvoiceTemplate'
import InvoiceViewer from './InvoiceViewer'
import { 
  transformOrderToInvoice, 
  calculateInvoiceTotals, 
  amountToWords 
} from './invoice-utils'

// ============================================
// Example 1: Simple Invoice Display
// ============================================

export function SimpleInvoiceExample() {
  const sampleInvoice = {
    invoiceNumber: 'INV-2026-00001',
    invoiceDate: '2026-02-05',
    orderId: 'ORD-2026-00001',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh@example.com',
    customerPhone: '+91-9876543210',
    billingAddress: {
      street: '123 MG Road, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      stateCode: '29'
    },
    shippingAddress: {
      street: '456 Brigade Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560025',
      country: 'India'
    },
    items: [
      {
        sno: 1,
        name: 'Classic Solid T-Shirt',
        description: 'Premium Cotton Blend - Black Color',
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
        description: 'Blue Wash - Size 32',
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
    paymentMode: 'UPI',
    transactionId: 'TXN20260205001',
    paymentStatus: 'Success'
  }

  return <InvoiceViewer invoiceData={sampleInvoice} />
}

// ============================================
// Example 2: Invoice from API Order Data
// ============================================

export function APIOrderInvoiceExample({ orderId }) {
  const [invoiceData, setInvoiceData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchOrderAndGenerateInvoice = async () => {
      try {
        // Fetch order from API
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Failed to fetch order')
        
        const order = await response.json()
        
        // Transform order to invoice format
        const invoice = transformOrderToInvoice(order)
        setInvoiceData(invoice)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderAndGenerateInvoice()
  }, [orderId])

  if (loading) return <div className="p-4">Loading invoice...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>
  if (!invoiceData) return <div className="p-4">No invoice data available</div>

  return <InvoiceViewer invoiceData={invoiceData} />
}

// ============================================
// Example 3: Invoice with Custom Calculations
// ============================================

export function CustomCalculationInvoiceExample() {
  const [invoiceData, setInvoiceData] = React.useState(null)

  React.useEffect(() => {
    // Build invoice with custom calculations
    const items = [
      { name: 'Product A', hsnCode: '6104', quantity: 3, unitPrice: 500 },
      { name: 'Product B', hsnCode: '6203', quantity: 1, unitPrice: 1500 },
      { name: 'Product C', hsnCode: '6105', quantity: 2, unitPrice: 800 }
    ]

    // Calculate totals for each item
    const calculatedItems = items.map((item, idx) => {
      const taxableAmount = item.quantity * item.unitPrice
      const gstPercent = 5
      const cgst = (taxableAmount * gstPercent) / 200
      const sgst = (taxableAmount * gstPercent) / 200
      const totalAmount = taxableAmount + cgst + sgst

      return {
        sno: idx + 1,
        ...item,
        taxableAmount,
        gstPercent,
        cgst,
        sgst,
        totalAmount
      }
    })

    const invoice = {
      invoiceNumber: 'INV-2026-00002',
      invoiceDate: new Date().toLocaleDateString('en-IN'),
      orderId: 'ORD-2026-00002',
      customerName: 'Priya Singh',
      customerEmail: 'priya@example.com',
      customerPhone: '+91-9765432100',
      billingAddress: {
        street: '789 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        country: 'India',
        stateCode: '36'
      },
      shippingAddress: {
        street: '789 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        country: 'India'
      },
      items: calculatedItems,
      paymentMode: 'Credit Card',
      transactionId: 'TXN20260205002',
      paymentStatus: 'Success'
    }

    setInvoiceData(invoice)
  }, [])

  return invoiceData ? <InvoiceViewer invoiceData={invoiceData} /> : <div>Loading...</div>
}

// ============================================
// Example 4: Invoice with Different GST Rates
// ============================================

export function MultipleGSTRatesExample() {
  const invoiceData = {
    invoiceNumber: 'INV-2026-00003',
    invoiceDate: '2026-02-05',
    orderId: 'ORD-2026-00003',
    customerName: 'Vikram Reddy',
    customerEmail: 'vikram@example.com',
    customerPhone: '+91-9654321000',
    billingAddress: {
      street: '321 Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500031',
      country: 'India',
      stateCode: '36'
    },
    shippingAddress: {
      street: '321 Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500031',
      country: 'India'
    },
    items: [
      {
        sno: 1,
        name: 'Regular T-Shirt (5% GST)',
        description: 'Cotton blend',
        hsnCode: '6104',
        quantity: 1,
        unitPrice: 499,
        taxableAmount: 499,
        gstPercent: 5,
        cgst: 12.48,
        sgst: 12.48,
        totalAmount: 523.96
      },
      {
        sno: 2,
        name: 'Premium Clothing (12% GST)',
        description: 'Branded apparel',
        hsnCode: '6105',
        quantity: 1,
        unitPrice: 2999,
        taxableAmount: 2999,
        gstPercent: 12,
        cgst: 179.94,
        sgst: 179.94,
        totalAmount: 3358.88
      }
    ],
    paymentMode: 'Net Banking',
    transactionId: 'TXN20260205003',
    paymentStatus: 'Success'
  }

  return <InvoiceViewer invoiceData={invoiceData} />
}

// ============================================
// Example 5: Bulk Order Invoice (Inter-State)
// ============================================

export function InterStateInvoiceExample() {
  const invoiceData = {
    invoiceNumber: 'INV-2026-00004',
    invoiceDate: '2026-02-05',
    orderId: 'ORD-2026-00004',
    customerName: 'Mumbai Retail Store',
    customerEmail: 'shop@mumbairetail.com',
    customerPhone: '+91-9876543210',
    billingAddress: {
      street: '1000 Business Park, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      stateCode: '29'
    },
    shippingAddress: {
      street: '500 Commercial Road, Andheri',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400059',
      country: 'India'
    },
    items: [
      {
        sno: 1,
        name: 'Bulk T-Shirt (50 pieces)',
        description: 'Assorted colors and sizes',
        hsnCode: '6104',
        quantity: 50,
        unitPrice: 250,
        taxableAmount: 12500,
        gstPercent: 5,
        cgst: 312.50,
        sgst: 312.50,
        totalAmount: 13125.00
      },
      {
        sno: 2,
        name: 'Bulk Jeans (25 pieces)',
        description: 'Assorted sizes',
        hsnCode: '6203',
        quantity: 25,
        unitPrice: 700,
        taxableAmount: 17500,
        gstPercent: 5,
        cgst: 437.50,
        sgst: 437.50,
        totalAmount: 18375.00
      }
    ],
    paymentMode: 'Bank Transfer',
    transactionId: 'TXN20260205004',
    paymentStatus: 'Success'
  }

  return <InvoiceViewer invoiceData={invoiceData} />
}

// ============================================
// Example 6: React Page Component Integration
// ============================================

export function OrderDetailsWithInvoice({ orderId }) {
  const [order, setOrder] = React.useState(null)
  const [invoiceData, setInvoiceData] = React.useState(null)

  React.useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Fetch order details
        const response = await fetch(`/api/orders/${orderId}`)
        const orderData = await response.json()
        setOrder(orderData)

        // Generate invoice
        const invoice = transformOrderToInvoice(orderData)
        setInvoiceData(invoice)
      } catch (error) {
        console.error('Error fetching order:', error)
      }
    }

    fetchOrderData()
  }, [orderId])

  if (!order || !invoiceData) {
    return <div className="p-4">Loading order details...</div>
  }

  return (
    <div className="space-y-8">
      {/* Order Summary Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Order #{order._id}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-green-600">{order.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold">₹{order.totalAmount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <p className="font-semibold text-blue-600">{order.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Invoice Section */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold p-6 border-b">Invoice</h2>
        <InvoiceViewer invoiceData={invoiceData} />
      </div>

      {/* Additional Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Order
        </button>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Download Invoice
        </button>
      </div>
    </div>
  )
}

// ============================================
// Export Examples
// ============================================

export default {
  SimpleInvoiceExample,
  APIOrderInvoiceExample,
  CustomCalculationInvoiceExample,
  MultipleGSTRatesExample,
  InterStateInvoiceExample,
  OrderDetailsWithInvoice
}
